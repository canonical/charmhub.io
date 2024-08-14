import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotFound from "../NotFound";

describe("NotFound", () => {
  test("renders without crashing", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "404: We couldn't find that page"
    );
  });

  test("displays the correct error image", () => {
    render(<NotFound />);
    const img = screen.getByAltText("Error 404 - Page not found");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://assets.ubuntu.com/v1/4de1c56c-404_v1.svg"
    );
    expect(img).toHaveAttribute("width", "346");
    expect(img).toHaveAttribute("height", "346");
  });

  test("displays the correct error message and links", () => {
    render(<NotFound />);
    expect(
      screen.getByText(/The page you requested isn't currently available./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The page that sent you here may have the wrong link./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The URL may be wrong. We recommend you check it for typos/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /We made a mistake and this page has stopped working momentarily/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You can let us know about this/i)
    ).toBeInTheDocument();

    const issueLink = screen.getByRole("link", { name: /here/i });
    expect(issueLink).toBeInTheDocument();
    expect(issueLink).toHaveAttribute(
      "href",
      "https://github.com/canonical-web-and-design/charmhub.io/issues/new"
    );

    const homepageLink = screen.getByRole("link", { name: /homepage/i });
    expect(homepageLink).toBeInTheDocument();
    expect(homepageLink).toHaveAttribute("href", "/");
  });

  test("renders the search form with correct attributes", () => {
    render(<NotFound />);
    const searchInput = screen.getByPlaceholderText("Search");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "search");
    expect(searchInput).toHaveAttribute("name", "q");
    expect(searchInput).toHaveAttribute("id", "search-input");

    const searchButton = screen.getByRole("button", { name: /search/i });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toHaveAttribute("type", "submit");
  });
});
