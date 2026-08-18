import { Hono } from "hono";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type MockInstance,
} from "vitest";

import middlewares from "./middlewares";

const app = new Hono();
const compressibleData = "hello".repeat(256);

app.use(middlewares(app));
app.get("/success/", (c) => c.body(null));
app.put("/success/", (c) => c.body(null));
app.get("/compressed/", (c) => c.json({ data: compressibleData }));
app.get("/timeout/", () => new Promise<Response>(() => undefined));

let log: MockInstance<typeof console.log>;

beforeAll(() => {
  log = vi.spyOn(console, "log").mockImplementation(() => undefined);
});

beforeEach(() => {
  log.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("middlewares", () => {
  test("logs the request and exposes its ID", async () => {
    const res = await app.request("/success/");

    expect(res.status).toBe(200);
    expect(log).toHaveBeenCalledTimes(2);
    expect(res.headers.get("X-Request-Id")).toMatch(
      /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/,
    );
    expect.assertions(3);
  });

  test("appends a trailing slash and preserves the query string", async () => {
    const res = await app.request("/success?name=Hono&language=en");

    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe(
      "http://localhost/success/?name=Hono&language=en",
    );
    expect(res.headers.get("X-Request-Id")).toMatch(
      /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/,
    );
    expect.assertions(3);
  });

  test("reports an unsupported method", async () => {
    const requestId = "test-request-id";
    const res = await app.request("/success/", {
      headers: {
        "X-Request-Id": requestId,
      },
      method: "POST",
    });

    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("GET, HEAD, PUT");
    expect(res.headers.get("X-Request-Id")).toBe(requestId);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(await res.json()).toEqual({
      errors: [
        {
          id: requestId,
          status: "405",
          title: "Method Not Allowed",
        },
      ],
    });
    expect.assertions(5);
  });

  test("times out slow requests", async () => {
    vi.useFakeTimers();
    const requestId = "test-request-id";
    const response = app.request("/timeout/", {
      headers: {
        "X-Request-Id": requestId,
      },
    });

    await vi.advanceTimersByTimeAsync(500);
    const res = await response;

    expect(res.status).toBe(504);
    expect(res.headers.get("X-Request-Id")).toBe(requestId);
    expect(await res.text()).toBe("Gateway Timeout");
    expect.assertions(3);
  });

  test("compresses responses with gzip", async () => {
    const res = await app.request("/compressed/", {
      headers: {
        "Accept-Encoding": "gzip",
      },
    });
    const body = await new Response(
      res.body?.pipeThrough(new DecompressionStream("gzip")),
    ).json();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Encoding")).toBe("gzip");
    expect(res.headers.get("Vary")).toBe("Accept-Encoding");
    expect(body).toEqual({ data: compressibleData });
    expect.assertions(4);
  });

  test.each([
    [
      "test",
      "/json/",
      `{
  "data": "hello"
}`,
    ],
    [
      "production",
      "/json/?pretty",
      '{"data":"hello"}',
    ],
  ] as const)("returns expected JSON in %s", async (nodeEnv, path, body) => {
    vi.stubEnv("NODE_ENV", nodeEnv);
    const envApp = new Hono();

    envApp.use(middlewares(envApp));
    envApp.get("/json/", (c) => c.json({ data: "hello" }));

    const res = await envApp.request(path);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe(body);
    expect.assertions(2);
  });
});
