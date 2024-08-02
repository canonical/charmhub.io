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

const queryClient = new QueryClient();
const Wrapper: React.FC = ({ children }: React.PropsWithChildren<{}>) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useSendMutation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(global, "scrollTo").mockImplementation(() => {});
  });

  test("should call setInviteLink and setInviteEmailLink on successful invite", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ token: "test-token", email: "test@example.com" }],
      }),
    } as Response);

    const setInviteLink = jest.fn();
    const setInviteEmailLink = jest.fn();
    const setShowInviteSuccess = jest.fn();
    const setShowInviteError = jest.fn();
    const csrfToken = "test-csrf-token";
    const packageName = "test-package";
    const publisherName = "Test Publisher";

    render(
      <TestComponent
        packageName={packageName}
        publisherName={publisherName}
        activeInviteEmail="test@example.com"
        csrfToken={csrfToken}
        setInviteLink={setInviteLink}
        setInviteEmailLink={setInviteEmailLink}
        setShowInviteSuccess={setShowInviteSuccess}
        setShowInviteError={setShowInviteError}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(setInviteLink).toHaveBeenCalledWith(
        `https://charmhub.io/accept-invite?package=${packageName}&token=test-token`
      );
      expect(setInviteEmailLink).toHaveBeenCalledWith(
        `mailto:test@example.com?subject=${publisherName} has invited you to collaborate on ${packageName}&body=Click this link to accept the invite: https%3A%2F%2Fcharmhub.io%2Faccept-invite%3Fpackage%3Dtest-package%26token%3Dtest-token`
      );
      expect(screen.getByText("Invite sent successfully")).toBeInTheDocument();
      expect(setShowInviteSuccess).toHaveBeenCalled();
    });
  });

  test("should call setShowInviteError on failed invite", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      statusText: "Failed to send invite",
      json: async () => ({ success: false, message: "Invite sending failed" }),
    } as Response);

    const setInviteLink = jest.fn();
    const setInviteEmailLink = jest.fn();
    const setShowInviteSuccess = jest.fn();
    const setShowInviteError = jest.fn();
    const csrfToken = "test-csrf-token";

    render(
      <TestComponent
        packageName="test-package"
        activeInviteEmail="test@example.com"
        csrfToken={csrfToken}
        setInviteLink={setInviteLink}
        setInviteEmailLink={setInviteEmailLink}
        setShowInviteSuccess={setShowInviteSuccess}
        setShowInviteError={setShowInviteError}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(setShowInviteError).toHaveBeenCalled();
      expect(
        screen.getByText(/Error: Failed to send invite/i)
      ).toBeInTheDocument();
    });
  });

  test("should do nothing if activeInviteEmail is not provided", async () => {
    const setInviteLink = jest.fn();
    const setInviteEmailLink = jest.fn();
    const setShowInviteSuccess = jest.fn();
    const setShowInviteError = jest.fn();
    const csrfToken = "test-csrf-token";

    render(
      <TestComponent
        packageName="test-package"
        csrfToken={csrfToken}
        setInviteLink={setInviteLink}
        setInviteEmailLink={setInviteEmailLink}
        setShowInviteSuccess={setShowInviteSuccess}
        setShowInviteError={setShowInviteError}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(setInviteLink).not.toHaveBeenCalled();
      expect(setInviteEmailLink).not.toHaveBeenCalled();
      expect(setShowInviteSuccess).not.toHaveBeenCalled();
      expect(setShowInviteError).not.toHaveBeenCalled();
    });
  });

  test("should call setShowSidePanel with false on successful invite if provided", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ token: "test-token", email: "test@example.com" }],
      }),
    } as Response);

    const setInviteLink = jest.fn();
    const setInviteEmailLink = jest.fn();
    const setShowInviteSuccess = jest.fn();
    const setShowInviteError = jest.fn();
    const setShowSidePanel = jest.fn();
    const csrfToken = "test-csrf-token";

    render(
      <TestComponent
        packageName="test-package"
        publisherName="Test Publisher"
        activeInviteEmail="test@example.com"
        csrfToken={csrfToken}
        setInviteLink={setInviteLink}
        setInviteEmailLink={setInviteEmailLink}
        setShowInviteSuccess={setShowInviteSuccess}
        setShowInviteError={setShowInviteError}
        setShowSidePanel={setShowSidePanel}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText("Send Invite"));

    await waitFor(() => {
      expect(setShowSidePanel).toHaveBeenCalledWith(false);
    });
  });
});
