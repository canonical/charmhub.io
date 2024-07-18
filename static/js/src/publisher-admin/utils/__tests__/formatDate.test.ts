import { formatDate } from "../formatDate";

describe("formatDate", () => {

  test("returns formatted date", () => {
    expect(formatDate("2021-08-01T00:00:00Z")).toBe("01 Aug 2021");
  });

  test("fails on invalid date", () => {
    expect(() => formatDate("invalid-date")).toThrow()
  })
})
