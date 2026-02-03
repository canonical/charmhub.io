import { HistoryState } from "../historyState";

describe("HistoryState", () => {
  let testHistoryState;

  beforeEach(() => {
    document.body.innerHTML = "";
    testHistoryState = new HistoryState();
    window.history.replaceState(null, "", "#/");
  });

  test("should have the 'testHistoryState' defined", () => {
    expect(testHistoryState).toBeDefined();
  });

  test("should update the first value in the path list", () => {
    const testPath = "test-path";

    testHistoryState.updatePath(0, testPath);
    expect(testHistoryState.path.length).toEqual(1);
    expect(testHistoryState.path[0]).toEqual(testPath);
  });

  test("should update an existing path element", () => {
    testHistoryState.updatePath(0, "initial-path");
    testHistoryState.updatePath(1, "updated-path");
    expect(testHistoryState.path[1]).toEqual("updated-path");
  });

  test("should add a second element to the path list", () => {
    testHistoryState.updatePath(0, "test-path");
    testHistoryState.updatePath(1, "test-path-1");
    expect(testHistoryState.path.length).toEqual(2);
    expect(testHistoryState.path[1]).toEqual("test-path-1");
  });

  test("should handle the case where path is a non-array value", () => {
    testHistoryState.updatePath(0, "single-value");
    expect(testHistoryState.path.length).toEqual(1);
    expect(testHistoryState.path[0]).toEqual("single-value");

    testHistoryState.updatePath(1, "second-value");
    expect(testHistoryState.path.length).toEqual(2);
    expect(testHistoryState.path[1]).toEqual("second-value");
  });

  test("should call registered listeners on popstate", () => {
    const mockListener = vi.fn();
    testHistoryState.addPopListener(mockListener);

    testHistoryState.updatePath(0, "new-path");
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: { path: ["new-path"] } })
    );

    expect(mockListener).toHaveBeenCalledWith({ path: ["new-path"] });
  });

  test("should handle multiple listeners", () => {
    const mockListener1 = vi.fn();
    const mockListener2 = vi.fn();
    testHistoryState.addPopListener(mockListener1);
    testHistoryState.addPopListener(mockListener2);

    testHistoryState.updatePath(0, "another-path");
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: { path: ["another-path"] } })
    );

    expect(mockListener1).toHaveBeenCalledWith({ path: ["another-path"] });
    expect(mockListener2).toHaveBeenCalledWith({ path: ["another-path"] });
  });

  test("should handle updatePath with different path arrays", () => {
    testHistoryState.updatePath(0, ["part1", "part2"]);
    expect(testHistoryState.path).toEqual(["part1", "part2"]);

    testHistoryState.updatePath(1, "updated-part");
    expect(testHistoryState.path).toEqual(["part1", "updated-part"]);
  });

  test("should correctly update URL with hash", () => {
    testHistoryState.updatePath(0, "path");
    expect(window.location.hash).toEqual("#path");

    testHistoryState.updatePath(1, "subpath");
    expect(window.location.hash).toEqual("#path/subpath");
  });

  test("should initialise with the correct path from the URL hash", () => {
    window.location.hash = "#initial/path";
    testHistoryState = new HistoryState();
    expect(testHistoryState.path).toEqual(["initial", "path"]);
  });

  test("should handle empty path array", () => {
    testHistoryState.updatePath(0, []);
    expect(testHistoryState.path).toEqual([]);
  });
});
