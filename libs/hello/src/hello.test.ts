import { describe, expect, test } from "vitest";

import hello from "./hello";

describe("hello", () => {
  test("returns the greeting", () => {
    expect(hello()).toBe("Hello via Bun!");
  });
});
