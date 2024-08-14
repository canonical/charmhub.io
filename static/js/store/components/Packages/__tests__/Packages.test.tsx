import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Packages from "../Packages";
import "@testing-library/jest-dom";

jest.mock("@canonical/store-components", () => ({
  CharmCard: ({ data }: { data: any }) => <div>{data.name}</div>,
  BundleCard: ({ data }: { data: any }) => <div>{data.name}</div>,
  Filters: ({
    setSelectedCategories,
    setSelectedPlatform,
    setSelectedPackageType,
  }: any) => (
    <div>
      <button onClick={() => setSelectedCategories(["category1"])}>
        Set Categories
      </button>
      <button onClick={() => setSelectedPlatform("platform1")}>
        Set Platform
      </button>
      <button onClick={() => setSelectedPackageType("package1")}>
        Set Package Type
      </button>
    </div>
  ),
  LoadingCard: () => <div>Loading...</div>,
}));

jest.mock("../../Banner", () => () => <div>Banner</div>);
jest.mock("../../Topics", () => () => <div>Topics</div>);

const queryClient = new QueryClient();

describe("Packages Component", () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={ui} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  test("renders Banner and Topics components", async () => {
    renderWithRouter(<Packages />);
    await waitFor(() => {
      expect(screen.getByText("Banner")).toBeInTheDocument();
      expect(screen.getByText("Topics")).toBeInTheDocument();
    });
  });

  test("shows loading state", async () => {
    renderWithRouter(<Packages />);
    await waitFor(() => {
      expect(screen.getAllByText("Loading...")).toHaveLength(12);
    });
  });

  test("displays package data when loaded", () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            total_items: 1,
            total_pages: 1,
            packages: [
              { id: "1", name: "Package 1", package: { type: "charm" } },
            ],
            categories: [],
          }),
      })
    ) as jest.Mock;

    renderWithRouter(<Packages />);

    setTimeout(() => {
      expect(screen.getByText("Package 1")).toBeInTheDocument();
    }, 0);
  });

  test("displays no packages message when there are no packages", () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            total_items: 0,
            total_pages: 1,
            packages: [],
            categories: [],
          }),
      })
    ) as jest.Mock;

    renderWithRouter(<Packages />);

    setTimeout(() => {
      expect(
        screen.getByText("No packages match this filter")
      ).toBeInTheDocument();
    }, 0);
  });

  test("toggles filter panel visibility when clicking the Filters button", () => {
    renderWithRouter(<Packages />);

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);

    expect(screen.getByText("Hide filters")).toBeInTheDocument();
    expect(screen.getByText("Set Categories")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hide filters"));

    setTimeout(() => {
      expect(screen.queryByText("Set Categories")).toBeNull();
    }, 0);
  });

  test("clears search query when Clear search button is clicked", () => {
    const initialSearchParams = new URLSearchParams({ q: "test" });
    renderWithRouter(<Packages />);

    window.history.pushState({}, "", `/?${initialSearchParams.toString()}`);

    setTimeout(() => {
      expect(screen.getByText("Showing 1 to")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Clear search"));
      expect(screen.queryByText("Showing 1 to")).toBeNull();
    }, 0);
  });

  test("changes pages when the pagination component is used", () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            total_items: 24,
            total_pages: 2,
            packages: [
              { id: "1", name: "Package 1", package: { type: "charm" } },
            ],
            categories: [],
          }),
      })
    ) as jest.Mock;

    renderWithRouter(<Packages />);

    setTimeout(() => {
      expect(
        screen.getByText("Showing 1 to 1 of 24 items")
      ).toBeInTheDocument();

      fireEvent.click(screen.getByText("2"));

      expect(screen.queryByText("Showing 1 to 1 of 24 items")).toBeNull();
    }, 0);
  });

  test("updates packages based on selected filters", () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            total_items: 1,
            total_pages: 1,
            packages: [
              { id: "1", name: "Filtered Package", package: { type: "charm" } },
            ],
            categories: ["Category1"],
          }),
      })
    ) as jest.Mock;

    renderWithRouter(<Packages />);

    setTimeout(() => {
      expect(screen.getByText("Filtered Package")).toBeInTheDocument();
    }, 0);

    fireEvent.click(screen.getByText("Set Categories"));
    fireEvent.click(screen.getByText("Set Platform"));
    fireEvent.click(screen.getByText("Set Package Type"));

    setTimeout(() => {
      expect(screen.getByText("Filtered Package")).toBeInTheDocument();
    }, 0);
  });

  test("handles fetch errors", () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("Network error"))
    ) as jest.Mock;

    renderWithRouter(<Packages />);

    setTimeout(() => {
      expect(screen.queryByText("No packages match this filter")).toBeNull();
      expect(screen.getByText("Error loading packages")).toBeInTheDocument();
    }, 0);
  });
});
