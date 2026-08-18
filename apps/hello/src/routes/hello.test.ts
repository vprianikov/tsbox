import { Hono } from "hono";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import middlewares from "../middlewares";
import hello from "./hello";

const app = new Hono();

app.use(middlewares(app));
app.route("/hello/", hello);

beforeAll(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("/hello/", async () => {
  test("GET 200", async () => {
    const res = await app.request("/hello/", {
      method: "GET",
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(await res.json()).toEqual({
      data: {
        message: "Hello, world!",
        method: "GET",
      },
    });
    expect.assertions(3);
  });

  test("PUT 200", async () => {
    const res = await app.request("/hello/", {
      method: "PUT",
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(await res.json()).toEqual({
      data: {
        message: "Hello, world!",
        method: "PUT",
      },
    });
    expect.assertions(3);
  });
});

describe("/hello/:name/", async () => {
  test("GET 200", async () => {
    const res = await app.request("/hello/Hono/", {
      method: "GET",
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(await res.json()).toEqual({
      data: {
        message: "Hello, Hono!",
      },
    });
    expect.assertions(3);
  });
});
