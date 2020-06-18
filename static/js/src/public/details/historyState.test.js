import { HistoryState } from "./historyState";

describe("HistoryState", () => {
  const testHistoryState = new HistoryState();

  it("should have the 'testHistoryState' defined", () => {
    expect(testHistoryState).toBeDefined();
  });

  it("should update the first value in the path list", () => {
    const testPath = "test-path";

    testHistoryState.updatePath(0, testPath);
    expect(testHistoryState.path.length).toEqual(1);
    expect(testHistoryState.path[0]).toEqual(testPath);
  });

  it("should add a second element to the path list", () => {
    const testPath = "test-path-1";

    testHistoryState.updatePath(1, testPath);
    expect(testHistoryState.path.length).toEqual(2);
    expect(testHistoryState.path[1]).toEqual(testPath);
  });
});
