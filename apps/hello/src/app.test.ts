import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import app from "./app";
import middlewares from "./middlewares";
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
  test("mounts globally", () => {
    expect(app.routes).toContainEqual(
      expect.objectContaining({
        handler: middlewares,
        method: "ALL",
        path: "/*",
      }),
    );
    expect.assertions(1);
  });
});

describe("errors", () => {
  const requestId = "test-request-id";

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
    const res = await app.request(path, {
      headers: {
        "X-Request-Id": requestId,
      },
    });

    expect(res.status).toBe(status);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(res.headers.get("X-Request-Id")).toBe(requestId);
    expect(await res.json()).toEqual({
      errors: [
        {
          id: requestId,
          status: status.toString(),
          title,
        },
      ],
    });
    expect.assertions(4);
  });
});
