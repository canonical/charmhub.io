import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Settings from "../Settings";

import { packageDataState } from "../../../state/atoms";
import { mockPackage } from "../../../mocks";
import JotaiTestProvider from "../../../../test-utils/JotaiTestProvider";

describe("Settings", () => {
  test("displays package status", () => {
    render(
      <JotaiTestProvider initialValues={[[packageDataState, mockPackage]]}>
        <Settings />
      </JotaiTestProvider>
    );

    expect(screen.getByText("Published (Listed)")).toBeInTheDocument();
  });
});
