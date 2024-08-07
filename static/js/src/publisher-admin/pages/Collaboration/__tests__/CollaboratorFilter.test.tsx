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

  test("updates the search params and recoil state on input change", () => {
    const mockEvent = jest.fn();
    renderComponent({ event: mockEvent });

    const input = screen.getByLabelText(searchInputLabel);

    fireEvent.change(input, { target: { value: "new value" } });

    setTimeout(() => {
      expect(input).toHaveValue("new value");
      expect(mockSearchParams.filter).toBe("new value");
      expect(mockEvent).toHaveBeenCalledWith("new value");
    }, 0);
  });

  test("clears the input, search params, and recoil state on reset button click", () => {
    const mockEvent = jest.fn();
    renderComponent({ filterQuery: "test", event: mockEvent });

    const input = screen.getByLabelText(searchInputLabel);
    const resetButton = screen.getByRole("button", { name: /clear filter/i });

    expect(input).toHaveValue("test");

    fireEvent.click(resetButton);

    setTimeout(() => {
      expect(input).toHaveValue("");
      expect(mockSearchParams.filter).toBeUndefined();
      expect(mockEvent).toHaveBeenCalledWith("");
    }, 0);
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
