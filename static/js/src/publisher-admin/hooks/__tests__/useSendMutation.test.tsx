import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import useSendMutation from "../useSendMutation";
import "@testing-library/jest-dom";

const TestComponent: React.FC<{
  packageName?: string;
  publisherName?: string;
  activeInviteEmail?: string;
  csrfToken: string;
  setInviteLink: React.Dispatch<React.SetStateAction<string>>;
  setInviteEmailLink: React.Dispatch<React.SetStateAction<string>>;
  setShowInviteSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setShowInviteError: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSidePanel?: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  packageName,
  publisherName,
  activeInviteEmail,
  csrfToken,
  setInviteLink,
  setInviteEmailLink,
  setShowInviteSuccess,
  setShowInviteError,
  setShowSidePanel,
}) => {
  const queryClient = new QueryClient();
  const mutation = useSendMutation(
    packageName,
    publisherName,
    activeInviteEmail,
    setInviteLink,
    setInviteEmailLink,
    setShowInviteSuccess,
    setShowInviteError,
    queryClient,
    csrfToken,
    setShowSidePanel
  );

  return (
    <div>
      <button onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
        Send Invite
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
      {mutation.isSuccess && <div>Invite sent successfully</div>}
    </div>
  );
};

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSendMutation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(global, "scrollTo").mockImplementation(() => {});
  });

  const mockFetchSuccess = () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ token: "test-token", email: "test@example.com" }],
      }),
    } as Response);
  };

  const mockFetchError = () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      statusText: "Failed to send invite",
    } as Response);
  };

  const setInviteLink = vi.fn();
  const setInviteEmailLink = vi.fn();
  const setShowInviteSuccess = vi.fn();
  const setShowInviteError = vi.fn();
  const setShowSidePanel = vi.fn();

  const csrfToken = "test-csrf-token";
  const packageName = "test-package";
  const publisherName = "Test Publisher";
  const email = "test@example.com";

  test("successfully sends invite and updates state", async () => {
    mockFetchSuccess();

    render(
      <TestComponent
        packageName={packageName}
        publisherName={publisherName}
        activeInviteEmail={email}
        csrfToken={csrfToken}
        setInviteLink={setInviteLink}
        setInviteEmailLink={setInviteEmailLink}
        setShowInviteSuccess={setShowInviteSuccess}
        setShowInviteError={setShowInviteError}
        setShowSidePanel={setShowSidePanel}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(setInviteLink).toHaveBeenCalledWith(
        `https://charmhub.io/accept-invite?package=${packageName}&token=test-token`
      );
      expect(setInviteEmailLink).toHaveBeenCalledWith(
        `mailto:${email}?subject=${publisherName} has invited you to collaborate on ${packageName}&body=Click this link to accept the invite: https%3A%2F%2Fcharmhub.io%2Faccept-invite%3Fpackage%3Dtest-package%26token%3Dtest-token`
      );
      expect(setShowInviteSuccess).toHaveBeenCalled();
      expect(setShowSidePanel).toHaveBeenCalledWith(false);
      expect(screen.getByText("Invite sent successfully")).toBeInTheDocument();
    });
  });

  test("shows error and calls setShowInviteError on fetch fail", async () => {
    mockFetchError();

    render(
      <TestComponent
        packageName={packageName}
        activeInviteEmail={email}
        csrfToken={csrfToken}
        setInviteLink={setInviteLink}
        setInviteEmailLink={setInviteEmailLink}
        setShowInviteSuccess={setShowInviteSuccess}
        setShowInviteError={setShowInviteError}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(setShowInviteError).toHaveBeenCalled();
      expect(
        screen.getByText(/Error: Failed to generate invite link/i)
      ).toBeInTheDocument();
    });
  });

  test("should do nothing if activeInviteEmail is not provided", async () => {
    render(
      <TestComponent
        packageName={packageName}
        activeInviteEmail={undefined}
        csrfToken={csrfToken}
        setInviteLink={setInviteLink}
        setInviteEmailLink={setInviteEmailLink}
        setShowInviteSuccess={setShowInviteSuccess}
        setShowInviteError={setShowInviteError}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(setInviteLink).not.toHaveBeenCalled();
      expect(setInviteEmailLink).not.toHaveBeenCalled();
      expect(setShowInviteSuccess).not.toHaveBeenCalled();
      expect(setShowInviteError).not.toHaveBeenCalled();
    });
  });
});
