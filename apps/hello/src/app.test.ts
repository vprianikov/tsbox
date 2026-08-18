import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import app from "./app";
import hello from "./routes/hello";

app.get("/error/", () => {
  throw new Error("Unexpected error");
});

beforeAll(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("routes", () => {
  test.each([
    [
      "/api/hello/",
      hello,
    ],
  ] as const)("mounts %s", (basePath, router) => {
    const handlers = new Set(router.routes.map(({ handler }) => handler));

    const mountedRoutes = app.routes.filter(({ handler }) =>
      handlers.has(handler),
    );

    expect(mountedRoutes).toHaveLength(router.routes.length);
    expect(mountedRoutes.every(({ path }) => path.startsWith(basePath))).toBe(
      true,
    );
    expect.assertions(2);
  });
});

describe("middlewares", () => {
  test.each([
    [
      "logger",
      "/*",
    ],
  ] as const)("mounts %s at %s", (_, path) => {
    expect(app.routes).toContainEqual(
      expect.objectContaining({
        method: "ALL",
        path,
      }),
    );
    expect.assertions(1);
  });
});

describe("errors", () => {
  test.each([
    [
      "/missing/",
      404,
      "Not Found",
    ],
    [
      "/error/",
      500,
      "Internal Server Error",
    ],
  ] as const)("handles %s", async (path, status, title) => {
    const res = await app.request(path);

    expect(res.status).toBe(status);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(await res.json()).toEqual({
      errors: [
        {
          status: status.toString(),
          title,
        },
      ],
    });
    expect.assertions(3);
  });
});
