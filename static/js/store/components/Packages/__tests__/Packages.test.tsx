import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
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

const renderPackages = () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Packages />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Packages component", () => {
  beforeEach(() => {
    jest.clearAllMocks();    
  });

  test("renders Banner and Topics components", async () => {
    renderPackages();
    await waitFor(() => {
      expect(screen.getByText("Banner")).toBeInTheDocument();
      expect(screen.getByText("Topics")).toBeInTheDocument();
    });
  });

  test("shows loading state", async () => {
    renderPackages();
    await waitFor(() => {
      expect(screen.getAllByText("Loading...")).toHaveLength(12);
    });
  });

  test("renders no packages message when there are no results", async () => {
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            total_items: 0,
            total_pages: 1,
            packages: [],
            categories: ["category1", "category2"],
          }),
      })
    );

    renderPackages();

    await waitFor(() => {
      expect(
        screen.getByText("No packages match this filter")
      ).toBeInTheDocument();
    });
  });
});
