const { arraysMerge } = require("../arrays");

describe("Arrays merge", () => {
  test("should merge two arrays without duplicates", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [3, 4, 5];
    const result = arraysMerge(arr1, arr2);

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test("should return an empty array when both arrays are empty", () => {
    const arr1 = [];
    const arr2 = [];
    const result = arraysMerge(arr1, arr2);

    expect(result).toEqual([]);
  });

  test("should return the first array when the second array is empty", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [];
    const result = arraysMerge(arr1, arr2);

    expect(result).toEqual(arr1);
  });

  test("should return the second array when the first array is empty", () => {
    const arr1 = [];
    const arr2 = [4, 5, 6];
    const result = arraysMerge(arr1, arr2);

    expect(result).toEqual(arr2);
  });

  test("should handle arrays with different data types", () => {
    const arr1 = [1, "apple", true];
    const arr2 = [false, "apple", 2];
    const result = arraysMerge(arr1, arr2);

    expect(result).toEqual([1, "apple", true, false, 2]);
  });

  test("should preserve the order of unique items", () => {
    const arr1 = [3, 2, 1];
    const arr2 = [5, 4, 3];
    const result = arraysMerge(arr1, arr2);

    expect(result).toEqual([3, 2, 1, 5, 4]);
  });

  test("should merge arrays with the same reference", () => {
    const sharedArray = [1, 2, 3];
    const arr1 = sharedArray;
    const arr2 = sharedArray;
    const result = arraysMerge(arr1, arr2);

    expect(result).toEqual([1, 2, 3]);
  });
});
