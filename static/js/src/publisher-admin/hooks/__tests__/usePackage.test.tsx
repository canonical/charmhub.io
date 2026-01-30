import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import usePackage from "../usePackage";
import "@testing-library/jest-dom";

const TestComponent: React.FC<{ packageName?: string }> = ({ packageName }) => {
  const { data, error, isLoading } = usePackage(packageName);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <h1>Package Details</h1>
      <p>ID: {data.id}</p>
      <p>Name: {data.name}</p>
      <p>Description: {data.description}</p>
    </div>
  );
};

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePackage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("should display loading state initially", async () => {
    render(<TestComponent packageName="test-package" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  test("should fetch and display package data", async () => {
    const mockData = {
      id: 1,
      name: "Test Package",
      description: "This is a test package",
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    } as Response);

    render(<TestComponent packageName="test-package" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText(`ID: ${mockData.id}`)).toBeInTheDocument();
      expect(screen.getByText(`Name: ${mockData.name}`)).toBeInTheDocument();
      expect(
        screen.getByText(`Description: ${mockData.description}`)
      ).toBeInTheDocument();
    });
  });

  test("should display a message when no packageName is provided", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: null }),
    } as Response);

    render(<TestComponent />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });
});
