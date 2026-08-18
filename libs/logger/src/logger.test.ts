import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import logger from "./logger";

const now = new Date(2026, 7, 18, 17, 44, 10, 123);
const app = new Hono();

app.use(logger("hello-api"));
app.get("/success/", (c) => c.text("Success"));
app.get("/redirect/", (c) => c.text("Redirect", 302));
app.get("/client-error/", (c) => c.text("Client error", 400));
app.get("/server-error/", (c) => c.text("Server error", 500));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubEnv("NO_COLOR", undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("logger", () => {
  test.each([
    [
      "/success/",
      200,
      "\u001B[32m200\u001B[0m",
    ],
    [
      "/redirect/",
      302,
      "\u001B[36m302\u001B[0m",
    ],
    [
      "/client-error/",
      400,
      "\u001B[33m400\u001B[0m",
    ],
    [
      "/server-error/",
      500,
      "\u001B[31m500\u001B[0m",
    ],
  ] as const)("logs %s in development", async (path, status, coloredStatus) => {
    vi.stubEnv("NODE_ENV", "development");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const res = await app.request(path);

    expect(res.status).toBe(status);
    expect(log).toHaveBeenNthCalledWith(
      1,
      `17:44:10.123 [hello-api] <-- GET ${path}`,
    );
    expect(log).toHaveBeenNthCalledWith(
      2,
      `17:44:10.123 [hello-api] --> GET ${path} ${coloredStatus} 0ms`,
    );
    expect.assertions(3);
  });

  test("logs JSON in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await app.request("/server-error/");

    const incoming = JSON.parse(log.mock.calls.at(0)?.at(0));
    const outgoing = JSON.parse(log.mock.calls.at(1)?.at(0));

    expect(incoming).toEqual({
      _time: now.toISOString(),
      _msg: "<-- GET /server-error/",
      service: "hello-api",
    });
    expect(outgoing).toEqual({
      _time: now.toISOString(),
      _msg: "--> GET /server-error/ 500 0ms",
      service: "hello-api",
    });
    expect.assertions(2);
  });
});
