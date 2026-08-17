import { describe, expect, test } from "vitest";

import hello from "./hello";

describe("hello", () => {
  test("returns the greeting", () => {
    expect.assertions(1);

    expect(hello()).toBe("Hello via Bun!");
  });
});
