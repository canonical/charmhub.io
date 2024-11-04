import capitalize from "../capitalize";

describe("capitalize", () => {
  test("returns capitalized word", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  test("returns undefined if no word", () => {
    expect(capitalize(undefined)).toBe(undefined);
  });
});
