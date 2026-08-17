import { afterEach, describe, expect, test, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Hello application", () => {
  test("prints the greeting", async () => {
    expect.assertions(2);

    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await import("./app");

    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith("Hello via Bun!");
  });
});
