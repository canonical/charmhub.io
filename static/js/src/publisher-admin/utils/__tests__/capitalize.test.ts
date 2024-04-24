import capitalize from "../capitalize";

describe("capitalize", () => {
  test("returns capitalized word", () => {
    expect(capitalize("hello")).toBe("Hello");
  });
});
