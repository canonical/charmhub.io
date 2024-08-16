import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import useRevokeMutation from "../useRevokeMutation";
import "@testing-library/jest-dom";

const TestComponent: React.FC<{
  packageName?: string;
  activeInviteEmail?: string;
  csrfToken: string;
  setShowRevokeSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRevokeError: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  packageName,
  activeInviteEmail,
  csrfToken,
  setShowRevokeSuccess,
  setShowRevokeError,
}) => {
  const queryClient = new QueryClient();
  const queryKey = "invitesData";

  const mutation = useRevokeMutation(
    packageName,
    activeInviteEmail,
    queryKey,
    setShowRevokeSuccess,
    setShowRevokeError,
    queryClient,
    csrfToken
  );

  return (
    <div>
      <button onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
        Revoke Invite
      </button>
      {mutation.isLoading && <div>Loading...</div>}
      {mutation.isError && (
        <div>
          Error:{" "}
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Unknown error"}
        </div>
      )}
      {mutation.isSuccess && <div>Revoke successful</div>}
    </div>
  );
};

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useRevokeMutation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(global, "scrollTo").mockImplementation(() => {});
  });

  test("should call setShowRevokeSuccess on successful revoke", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const setShowRevokeSuccess = jest.fn();
    const setShowRevokeError = jest.fn();
    const csrfToken = "test-csrf-token";

    render(
      <TestComponent
        packageName="test-package"
        activeInviteEmail="test@example.com"
        csrfToken={csrfToken}
        setShowRevokeSuccess={setShowRevokeSuccess}
        setShowRevokeError={setShowRevokeError}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText("Revoke Invite"));

    await waitFor(() => {
      expect(setShowRevokeSuccess).toHaveBeenCalled();
      expect(screen.getByText("Revoke successful")).toBeInTheDocument();
    });
  });

  test("should call setShowRevokeError on failed revoke", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      statusText: "Failed to revoke invite",
      json: async () => ({ success: false, message: "Revoke failed" }),
    } as Response);

    const setShowRevokeSuccess = jest.fn();
    const setShowRevokeError = jest.fn();
    const csrfToken = "test-csrf-token";

    render(
      <TestComponent
        packageName="test-package"
        activeInviteEmail="test@example.com"
        csrfToken={csrfToken}
        setShowRevokeSuccess={setShowRevokeSuccess}
        setShowRevokeError={setShowRevokeError}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText("Revoke Invite"));

    await waitFor(() => {
      expect(setShowRevokeError).toHaveBeenCalled();
      expect(
        screen.getByText(
          (content) =>
            content.includes("Error:") &&
            content.includes("Failed to revoke invite")
        )
      ).toBeInTheDocument();
    });
  });

  test("should do nothing if activeInviteEmail is not provided", async () => {
    const setShowRevokeSuccess = jest.fn();
    const setShowRevokeError = jest.fn();
    const csrfToken = "test-csrf-token";

    render(
      <TestComponent
        packageName="test-package"
        csrfToken={csrfToken}
        setShowRevokeSuccess={setShowRevokeSuccess}
        setShowRevokeError={setShowRevokeError}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText("Revoke Invite"));

    await waitFor(() => {
      expect(setShowRevokeSuccess).not.toHaveBeenCalled();
      expect(setShowRevokeError).not.toHaveBeenCalled();
    });
  });
});
