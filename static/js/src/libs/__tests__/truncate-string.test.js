import { truncateString } from "../truncate-string";

describe("Truncate string", () => {
  test("returns the original string if it is shorter than the specified length", () => {
    const result = truncateString("Hello", 10);
    expect(result).toBe("Hello");
  });

  test("returns the original string if it is exactly the specified length", () => {
    const result = truncateString("Hello", 5);
    expect(result).toBe("Hello");
  });

  test("truncates string correctly at the last word break before the limit", () => {
    const result = truncateString("Hello World", 8);
    expect(result).toBe("Hello…");
  });

  test("truncates string and appends custom append string", () => {
    const result = truncateString("Hello World", 8, "...");
    expect(result).toBe("Hello...");
  });

  test("returns an empty string when input is an empty string", () => {
    const result = truncateString("", 5);
    expect(result).toBe("");
  });

  test("returns an empty string when length is zero", () => {
    const result = truncateString("Hello", 0);
    expect(result).toBe("");
  });

  test("returns an empty string when length is negative", () => {
    const result = truncateString("Hello", -1);
    expect(result).toBe("");
  });

  test("returns the original string if append string is longer than the specified length", () => {
    const result = truncateString("Hello", 2, "...");
    expect(result).toBe("Hello");
  });

  test("handles single word string longer than limit", () => {
    const result = truncateString("CanonicalCharmedMongoDB", 10);
    expect(result).toBe("Canonical…");
  });

  test("handles string with multiple spaces correctly", () => {
    const result = truncateString("Hello     World", 10);
    expect(result).toBe("Hello…");
  });

  test("handles a string that fits within the limit after truncating a long word", () => {
    const result = truncateString("Hello Charmhub World", 12);
    expect(result).toBe("Hello…");
  });

  test("does not truncate if the append length is zero and the string is within the limit", () => {
    const result = truncateString("Hello World", 15, "");
    expect(result).toBe("Hello World");
  });

  test("does not append when append is an empty string", () => {
    const result = truncateString("Hello World", 8, "");
    expect(result).toBe("Hello");
  });
});
