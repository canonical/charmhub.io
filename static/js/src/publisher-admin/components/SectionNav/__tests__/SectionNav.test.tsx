import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import SectionNav from "../SectionNav";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
  useLocation: () => ({
    pathname: "/test-charm-name/settings",
  }),
}));

describe("SectionNav", () => {
  test("displays package status", () => {
    render(
      <BrowserRouter>
        <SectionNav />
      </BrowserRouter>
    );

    expect(screen.getByText("Settings")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
