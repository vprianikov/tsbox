import { describe, expect, test } from "vitest";

import greeting from "./greeting.js";

describe("greeting", () => {
  test("Hello World by default", () => {
    expect(greeting()).toBe("Hello World!");
    expect.assertions(1);
  });

  test("Hello by name", () => {
    expect(greeting("Vitest")).toBe("Hello Vitest!");
    expect.assertions(1);
  });
});
