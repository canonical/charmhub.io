import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import useCollaboratorsQuery from "../useCollaboratorsQuery";
import "@testing-library/jest-dom";

const TestComponent: React.FC<{ packageName?: string }> = ({ packageName }) => {
  const { data, error, isLoading } = useCollaboratorsQuery(packageName);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      {data && data.length > 0 ? (
        <ul>
          {data.map((collaborator: { id: number; name: string }) => (
            <li key={collaborator.id}>{collaborator.name}</li>
          ))}
        </ul>
      ) : (
        <div>No collaborators found</div>
      )}
    </div>
  );
};

const queryClient = new QueryClient();

const Wrapper: React.FC = ({ children }: React.PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useCollaboratorsQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should display loading state initially", async () => {
    render(<TestComponent packageName="test-package" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  test("should fetch and display collaborators data", async () => {
    const mockData = {
      success: true,
      data: [{ id: 1, name: "Collaborator 1" }],
    };
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<TestComponent packageName="test-package" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Collaborator 1")).toBeInTheDocument();
    });
  });

  test("should display a message when no packageName is provided", async () => {
    const mockData = { success: true, data: [] };
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<TestComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("No collaborators found")).toBeInTheDocument();
    });
  });
});
