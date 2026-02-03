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

  beforeEach(() => {
    mockSetSearchParams = jest.fn();
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);

    mockSearchRef = {
      current: document.createElement("input"),
    };
  });

  test("should render the Banner component", () => {
    render(<Banner searchRef={mockSearchRef} />);

    expect(
      screen.getByRole("heading", { name: /The Charm Collection/i })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Search Charmhub")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Close/i })).toBeInTheDocument();
  });

  test("should update search params and scroll on form submission", () => {
    render(<Banner searchRef={mockSearchRef} />);

    if (mockSearchRef.current) {
      mockSearchRef.current.value = "kubernetes";
    }

    fireEvent.submit(screen.getByRole("button", { name: /Search/i }));

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      new URLSearchParams({ q: "kubernetes" })
    );
  });

  test("should clear search params on reset button click", () => {
    render(<Banner searchRef={mockSearchRef} />);

    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    expect(mockSetSearchParams).toHaveBeenCalledWith(new URLSearchParams());
  });

  test("should not update search params when input is empty", () => {
    render(<Banner searchRef={mockSearchRef} />);

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

    render(<Banner searchRef={mockSearchRef} />);

    const searchInput = screen.getByPlaceholderText(
      "Search Charmhub"
    ) as HTMLInputElement;
    expect(searchInput.value).toBe("test");
  });
});
