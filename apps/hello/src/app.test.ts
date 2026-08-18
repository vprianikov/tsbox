import { describe, expect, test } from "vitest";

import app from "./app";
import hello from "./routes/hello";

app.get("/error/", () => {
  throw new Error("Unexpected error");
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

describe("errors", () => {
  test.each([
    [
      "/api/missing/",
      404,
      "Not Found",
    ],
    [
      "/api/error/",
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
