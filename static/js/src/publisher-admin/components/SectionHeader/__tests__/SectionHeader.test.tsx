import { MutableSnapshot, RecoilRoot } from "recoil";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import SectionHeader from "../SectionHeader";

import { packageDataState } from "../../../state/atoms";
import { mockPackage } from "../../../mocks";

const renderComponent = () =>
  render(
    <RecoilRoot
      initializeState={(snapshot: MutableSnapshot) => {
        return snapshot.set(packageDataState, mockPackage);
      }}
    >
      <SectionHeader />
    </RecoilRoot>
  );

describe("SectionHeader", () => {
  test("displays package and publisher names", () => {
    renderComponent();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "test-charm-name by John Doe"
    );
  });
});
