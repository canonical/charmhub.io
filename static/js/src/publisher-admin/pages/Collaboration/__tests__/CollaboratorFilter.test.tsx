import React from "react";
import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import CollaboratorFilter from "../CollaboratorFilter";
import { filterQueryState } from "../../../state/atoms";
import { RecoilObserver, QueryProvider } from "../../../utils";

let mockSearchParams = { filter: "" };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: () => [
    new URLSearchParams(mockSearchParams),
    jest.fn((params) => {
      mockSearchParams = { ...params };
    }),
  ],
}));

const renderComponent = ({
  event,
  filterQuery,
}: {
  event?: () => void;
  filterQuery?: string;
}) => {
  mockSearchParams.filter = filterQuery || "";

  return render(
    <RecoilRoot>
      <BrowserRouter>
        <QueryProvider>
          <RecoilObserver node={filterQueryState} event={event || jest.fn()} />
          <CollaboratorFilter />
        </QueryProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
};

const searchInputLabel = "Search collaborators";

describe("CollaboratorFilter", () => {
  test("displays an empty input if no filter query string exists", () => {
    renderComponent({ filterQuery: "" });
    const component = screen.getByLabelText(searchInputLabel);
    expect(component).toHaveValue("");
  });

  test("displays filter query string value in input if it exists", () => {
    renderComponent({ filterQuery: "testing" });
    const component = screen.getByLabelText(searchInputLabel);
    expect(component).toHaveValue("testing");
  });

  test("submits the search query when the search button is clicked", () => {
    renderComponent({ filterQuery: "search term" });

    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.click(searchButton);

    expect(screen.getByLabelText(searchInputLabel)).toHaveValue("search term");
  });

  test("has accessible labels for the input and buttons", () => {
    renderComponent({ filterQuery: "" });

    const input = screen.getByLabelText("Search collaborators");
    const resetButton = screen.getByRole("button", { name: /clear filter/i });
    const searchButton = screen.getByRole("button", { name: /search/i });

    expect(input).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });
});
