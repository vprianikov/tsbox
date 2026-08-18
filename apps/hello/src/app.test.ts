import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import app from "./app";
import hello from "./routes/hello";

app.get("/success/", (c) => c.body(null));

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
  test("mounts request middlewares globally", () => {
    expect(
      app.routes.filter(
        ({ method, path }) => method === "ALL" && path === "/*",
      ),
    ).toHaveLength(2);
    expect.assertions(1);
  });

  test("exposes a generated request ID", async () => {
    const res = await app.request("/success/");

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Request-Id")).toMatch(
      /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/,
    );
    expect.assertions(2);
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
