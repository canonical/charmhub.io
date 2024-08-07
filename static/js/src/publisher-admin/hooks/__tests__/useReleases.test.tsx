import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import useReleases from "../useReleases";
import "@testing-library/jest-dom";

const TestComponent: React.FC<{ packageName?: string }> = ({ packageName }) => {
  const { data, error, isLoading } = useReleases(packageName);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  if (!data || Object.keys(data.releases).length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <h1>Releases:</h1>
      <ul>
        {Object.keys(data.releases).length > 0 ? (
          Object.keys(data.releases).map((channel) => (
            <li key={channel}>
              <strong>{channel}</strong>:{" "}
              {JSON.stringify(data.releases[channel])}
            </li>
          ))
        ) : (
          <li>No releases available</li>
        )}
      </ul>
      <h2>Architectures:</h2>
      <ul>
        {data.all_architectures.length > 0 ? (
          data.all_architectures.map((arch) => <li key={arch}>{arch}</li>)
        ) : (
          <li>No architectures available</li>
        )}
      </ul>
    </div>
  );
};

const queryClient = new QueryClient();
const Wrapper: React.FC = ({ children }: React.PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useReleases", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should display loading state initially", () => {
    render(<TestComponent packageName="test-package" />, { wrapper: Wrapper });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("should fetch and display release data", async () => {
    const mockData = {
      success: true,
      data: {
        releases: {
          "v1.0": { version: "1.0", releaseDate: "2023-01-01" },
          "v2.0": { version: "2.0", releaseDate: "2023-06-01" },
        },
        all_architectures: ["x86", "arm64"],
      },
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<TestComponent packageName="test-package" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("v1.0")).toBeInTheDocument();
      expect(screen.getByText("v2.0")).toBeInTheDocument();
      expect(screen.getByText("x86")).toBeInTheDocument();
      expect(screen.getByText("arm64")).toBeInTheDocument();
    });
  });

  test("should display a message when no packageName is provided", async () => {
    const mockData = {
      success: true,
      data: { releases: {}, all_architectures: [] },
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<TestComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });
});
