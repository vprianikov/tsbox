import { Hono } from "hono";
import { afterEach, describe, expect, test, vi } from "vitest";

import middlewares from "./middlewares";

const app = new Hono();

app.use(middlewares);
app.get("/success/", (c) => c.body(null));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("middlewares", () => {
  test("logs the request and exposes its ID", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const res = await app.request("/success/");

    expect(res.status).toBe(200);
    expect(log).toHaveBeenCalledTimes(2);
    expect(res.headers.get("X-Request-Id")).toMatch(
      /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/,
    );
    expect.assertions(3);
  });
});
