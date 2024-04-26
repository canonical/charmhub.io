import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import SectionNav from "../SectionNav";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
}));

const renderComponent = () => {
  render(
    <BrowserRouter>
      <SectionNav />
    </BrowserRouter>
  );
};

describe("SectionNav", () => {
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
});
