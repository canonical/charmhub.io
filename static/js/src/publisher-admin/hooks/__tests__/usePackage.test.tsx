import * as ReactQuery from "react-query";
import { renderHook } from "@testing-library/react";

import usePackage from "../usePackage";

describe("usePackage", () => {
  test("Calls useQuery", () => {
    jest.spyOn(ReactQuery, "useQuery").mockImplementation(jest.fn());
    renderHook(() => usePackage("test-charm-name"));
    expect(ReactQuery.useQuery).toHaveBeenCalled();
  });
});
