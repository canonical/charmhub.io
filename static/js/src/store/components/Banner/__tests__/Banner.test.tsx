import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSearchParams } from "react-router-dom";
import Banner from "../Banner";

jest.mock("react-router-dom", () => ({
  useSearchParams: jest.fn(),
}));

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe("Banner Component", () => {
  let mockSetSearchParams: jest.Mock;
  let mockSearchRef: React.RefObject<HTMLInputElement>;
  let mockSearchSummaryRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    mockSetSearchParams = jest.fn();
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);

    mockSearchRef = {
      current: document.createElement("input"),
    };

    mockSearchSummaryRef = {
      current: document.createElement("div"),
    };
  });

  test("should render the Banner component", () => {
    render(
      <Banner
        searchRef={mockSearchRef}
        searchSummaryRef={mockSearchSummaryRef}
        disabled={false}
      />
    );

    expect(
      screen.getByRole("heading", { name: /The Charm Collection/i })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Search Charmhub")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Close/i })).toBeInTheDocument();
  });

  test("should update search params and scroll on form submission", () => {
    render(
      <Banner
        searchRef={mockSearchRef}
        searchSummaryRef={mockSearchSummaryRef}
        disabled={false}
      />
    );

    if (mockSearchRef.current) {
      mockSearchRef.current.value = "kubernetes";
    }

    fireEvent.submit(screen.getByRole("button", { name: /Search/i }));

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      new URLSearchParams({ q: "kubernetes" })
    );

    expect(mockSearchSummaryRef.current?.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
    });
  });

  test("should clear search params on reset button click", () => {
    render(
      <Banner
        searchRef={mockSearchRef}
        searchSummaryRef={mockSearchSummaryRef}
        disabled={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    expect(mockSetSearchParams).toHaveBeenCalledWith(new URLSearchParams());
  });

  test("should not update search params when input is empty", () => {
    render(
      <Banner
        searchRef={mockSearchRef}
        searchSummaryRef={mockSearchSummaryRef}
        disabled={false}
      />
    );

    if (mockSearchRef.current) {
      mockSearchRef.current.value = "";
    }

    fireEvent.submit(screen.getByRole("button", { name: /Search/i }));

    expect(mockSetSearchParams).not.toHaveBeenCalled();
  });

  test("should preserve query parameter in input field", () => {
    const searchParams = new URLSearchParams({ q: "test" });
    (useSearchParams as jest.Mock).mockReturnValue([
      searchParams,
      mockSetSearchParams,
    ]);

    render(
      <Banner
        searchRef={mockSearchRef}
        searchSummaryRef={mockSearchSummaryRef}
        disabled={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      "Search Charmhub"
    ) as HTMLInputElement;
    expect(searchInput.value).toBe("test");
  });

  test("should call scrollIntoView on form submission", () => {
    render(
      <Banner
        searchRef={mockSearchRef}
        searchSummaryRef={mockSearchSummaryRef}
        disabled={false}
      />
    );

    if (mockSearchSummaryRef.current) {
      mockSearchSummaryRef.current.scrollIntoView = jest.fn();
    }

    fireEvent.submit(screen.getByRole("button", { name: /Search/i }));

    expect(mockSearchSummaryRef.current?.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
    });
  });

  test("should disable search functionality while loading charms", () => {
    render(
      <Banner
        searchRef={mockSearchRef}
        searchSummaryRef={mockSearchSummaryRef}
        disabled={true}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search Charmhub");
    const searchButton = screen.getByRole("button", { name: /Search/i });

    expect(searchInput).toBeDisabled();
    expect(searchButton).toBeDisabled();
  });
});
