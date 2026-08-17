import { afterEach, describe, expect, test, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Hello application", () => {
  test("prints the greeting", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await import("./app");

    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith("Hello via Bun!");
  });
});
