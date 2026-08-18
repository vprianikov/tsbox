import { describe, expect, test } from "vitest";

import app from "./app";
import hello from "./routes/hello";

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
