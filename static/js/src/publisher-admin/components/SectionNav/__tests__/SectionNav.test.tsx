import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import SectionNav from "../SectionNav";
import { packageDataState } from "../../../state/atoms";
import { Package } from "../../../types";
import { mockPackage } from "../../../mocks";
import JotaiTestProvider from "../../../../test-utils/JotaiTestProvider";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
}));

const renderComponent = (mockPackageData?: Package) => {
  render(
    <BrowserRouter>
      <JotaiTestProvider initialValues={[[packageDataState, mockPackageData]]}>
        <SectionNav />
      </JotaiTestProvider>
    </BrowserRouter>
  );
};

describe("SectionNav", () => {
  test("shows releases tab for charms", async () => {
    const user = userEvent.setup();
    renderComponent(mockPackage);

    await user.click(screen.getByText("Releases"));

    expect(screen.getByText("Releases")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("hides releases tab by default", async () => {
    renderComponent();

    expect(screen.queryByText("Releases")).not.toBeInTheDocument();
  });

  test("highlights publicise nav link", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Publicise"));

    expect(screen.getByText("Publicise")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("highlights settings nav link", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Settings"));

    expect(screen.getByText("Settings")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("highlights listing nav link", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Listing"));

    expect(screen.getByText("Listing")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("highlights collaboration link", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Collaboration"));

    expect(screen.getByText("Collaboration")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
