import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import SectionHeader from "../SectionHeader";

import { packageDataState } from "../../../state/atoms";
import { mockPackage } from "../../../mocks";
import JotaiTestProvider from "../../../../test-utils/JotaiTestProvider";

const renderComponent = () =>
  render(
    <JotaiTestProvider initialValues={[[packageDataState, mockPackage]]}>
      <SectionHeader />
    </JotaiTestProvider>
  );

describe("SectionHeader", () => {
  test("displays package and publisher names", () => {
    renderComponent();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "test-charm-name by John Doe"
    );
  });
});
