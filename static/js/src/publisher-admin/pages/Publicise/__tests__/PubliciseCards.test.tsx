import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import PubliciseCards from "../PubliciseCards";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
}));

const renderComponent = () => {
  render(
    <BrowserRouter>
      <PubliciseCards />
    </BrowserRouter>
  );
};

describe("PubliciseCards", () => {
  test("selected dark button by default", () => {
    renderComponent();
    expect(screen.getByLabelText("Dark")).toBeChecked();
  });

  test("shows a dark button if selected", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByLabelText("Dark"));
    expect(screen.getByText(/button=black/)).toBeInTheDocument();
  });

  test("shows a light button if selected", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByLabelText("Light"));
    expect(screen.getByText(/button=white/)).toBeInTheDocument();
  });

  test("hides the button if selected", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByLabelText("Hide button"));
    expect(screen.queryByText(/button=/)).not.toBeInTheDocument();
  });

  test("shows channels by default", () => {
    renderComponent();
    expect(screen.getByLabelText("All channels")).toBeChecked();
  });

  test("shows channels if selected", async () => {
    renderComponent();
    expect(screen.getByText(/channels=/)).toBeInTheDocument();
  });

  test("hides channels if not selected", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByLabelText("All channels"));
    expect(screen.queryByText(/channels=/)).not.toBeInTheDocument();
  });

  test("shows summary by default", () => {
    renderComponent();
    expect(screen.getByLabelText("Show summary")).toBeChecked();
  });

  test("shows summary if selected", async () => {
    renderComponent();
    expect(screen.getByText(/summary=/)).toBeInTheDocument();
  });

  test("hides summary if not selected", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByLabelText("Show summary"));
    expect(screen.queryByText(/summary=/)).not.toBeInTheDocument();
  });

  test("shows base by default", () => {
    renderComponent();
    expect(screen.getByLabelText("Show runs on")).toBeChecked();
  });

  test("shows base if selected", async () => {
    renderComponent();
    expect(screen.getByText(/base=/)).toBeInTheDocument();
  });

  test("hides base if not selected", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByLabelText("Show runs on"));
    expect(screen.queryByText(/base=/)).not.toBeInTheDocument();
  });

  test("card preview is rendered", () => {
    renderComponent();
    expect(
      screen.getByTitle("test-charm-name embeddable card")
    ).toBeInTheDocument();
  });
});
