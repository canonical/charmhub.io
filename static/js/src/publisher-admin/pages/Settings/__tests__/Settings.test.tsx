import { MutableSnapshot, RecoilRoot } from "recoil";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Settings from "../Settings";

import { packageDataState } from "../../../state/atoms";
import { mockPackage } from "../../../mocks";

describe("Settings", () => {
  test("displays package status", () => {
    render(
      <RecoilRoot
        initializeState={(snapshot: MutableSnapshot) => {
          return snapshot.set(packageDataState, mockPackage);
        }}
      >
        <Settings />
      </RecoilRoot>
    );

    expect(screen.getByText("Published")).toBeInTheDocument();
  });
});
