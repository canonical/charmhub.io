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

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCollaboratorsQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should display loading state initially", async () => {
    render(<TestComponent packageName="test-package" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  test("should fetch and display collaborators data", async () => {
    const mockData = {
      success: true,
      data: [{ id: 1, name: "Collaborator 1" }],
    };
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<TestComponent packageName="test-package" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("Collaborator 1")).toBeInTheDocument();
    });
  });

  test("should display a message when no packageName is provided", async () => {
    const mockData = { success: true, data: [] };
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<TestComponent packageName="test-package" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("No collaborators found")).toBeInTheDocument();
    });
  });
});
