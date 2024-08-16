import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import useInvitesQuery from "../useInvitesQuery";
import "@testing-library/jest-dom";

const TestComponent: React.FC<{ packageName?: string }> = ({ packageName }) => {
  const { data, error, isLoading } = useInvitesQuery(packageName);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      {data && data.length > 0 ? (
        <ul>
          {data.map((invite: { id: number; email: string }) => (
            <li key={invite.id}>{invite.email}</li>
          ))}
        </ul>
      ) : (
        <div>No invites found</div>
      )}
    </div>
  );
};

const queryClient = new QueryClient();
const Wrapper: React.FC = ({ children }: React.PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useInvitesQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should display loading state initially", async () => {
    render(<TestComponent packageName="test-package" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  test("should fetch and display invites data", async () => {
    const mockData = {
      success: true,
      data: [{ id: 1, email: "invite@example.com" }],
    };
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<TestComponent packageName="test-package" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("invite@example.com")).toBeInTheDocument();
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
      expect(screen.getByText("No invites found")).toBeInTheDocument();
    });
  });
});
