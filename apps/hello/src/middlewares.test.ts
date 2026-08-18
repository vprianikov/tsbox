import { Hono } from "hono";
import {
  afterAll,
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

app.use(middlewares(app));
app.get("/success/", (c) => c.body(null));
app.put("/success/", (c) => c.body(null));

let log: MockInstance<typeof console.log>;

beforeAll(() => {
  log = vi.spyOn(console, "log").mockImplementation(() => undefined);
});

beforeEach(() => {
  log.mockClear();
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
});
