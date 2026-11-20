import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import "@testing-library/jest-dom";

import Invites from "../Invites";
import { invitesListState } from "../../../state/atoms";
import { generateInviteToken } from "../../../utils/generateInviteToken";
import JotaiTestProvider from "../../../../test-utils/JotaiTestProvider";

vi.mock("../../../utils/generateInviteToken", () => ({
  generateInviteToken: vi.fn(),
}));

const email = "invitee@example.com";
const packageName = "test-package";
const inviteLink =
  "https://charmhub.io/accept-invite?package=test-package&token=test-token";
const generatedInvite = { token: "test-token", inviteLink };
const mockGenerateInviteToken = vi.mocked(generateInviteToken);

function renderInvites() {
  const queryClient = new QueryClient();
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  const invite = {
    "accepted-at": null,
    "created-at": "2024-01-01T00:00:00Z",
    "created-by": {
      "display-name": "Publisher",
      email: "publisher@example.com",
      id: "publisher-id",
      username: "publisher",
    },
    email,
    "expires-at": "2099-01-01T00:00:00Z",
    "invite-type": "package-collaborator",
    "revoked-at": null,
  };

  render(
    <JotaiTestProvider initialValues={[[invitesListState, [invite]]]}>
      <MemoryRouter initialEntries={[`/${packageName}/collaboration`]}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route
              path="/:packageName/collaboration"
              element={
                <Invites
                  setShowRevokeModal={vi.fn()}
                  setShowReopenModal={vi.fn()}
                />
              }
            />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>
    </JotaiTestProvider>
  );
  return { invalidateQueries };
}

async function openResendConfirmation() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Resend invite" }));
  const clipboard = vi
    .spyOn(navigator.clipboard, "writeText")
    .mockResolvedValue(undefined);
  return { user, dialog: within(screen.getByRole("dialog")), clipboard };
}

describe("Invites", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.CSRF_TOKEN = "test-csrf-token";
  });

  test("requires explicit confirmation that resending creates/reissues an invitation and emails the invitee", async () => {
    renderInvites();
    expect(
      screen.queryByRole("button", { name: "Copy invite URL" })
    ).not.toBeInTheDocument();

    const { user, dialog, clipboard } = await openResendConfirmation();
    expect(
      dialog.getByText("The existing invite URL is not available here.")
    ).toBeInTheDocument();
    expect(
      dialog.getByText(/This will create or reissue the invitation/)
    ).toHaveTextContent(
      `This will create or reissue the invitation for ${email} and send them an email.`
    );
    expect(mockGenerateInviteToken).not.toHaveBeenCalled();
    expect(clipboard).not.toHaveBeenCalled();

    await user.click(dialog.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockGenerateInviteToken).not.toHaveBeenCalled();
  });

  test("resends only after confirmation, then copying the available URL never resends", async () => {
    mockGenerateInviteToken.mockResolvedValue(generatedInvite);
    const { invalidateQueries } = renderInvites();
    const { user, dialog, clipboard } = await openResendConfirmation();

    await user.click(dialog.getByRole("button", { name: "Resend invite" }));
    expect(mockGenerateInviteToken).toHaveBeenCalledTimes(1);
    expect(mockGenerateInviteToken).toHaveBeenCalledWith(
      email,
      packageName,
      "test-csrf-token"
    );
    expect(invalidateQueries).toHaveBeenCalledWith("invitesData");
    expect(dialog.getByText(inviteLink)).toBeInTheDocument();
    expect(clipboard).not.toHaveBeenCalled();
    await user.click(dialog.getByRole("button", { name: "Copy invite URL" }));
    expect(clipboard).toHaveBeenCalledWith(inviteLink);
    await user.click(dialog.getByRole("button", { name: "Done" }));
    await user.click(screen.getByRole("button", { name: "URL copied!" }));
    expect(clipboard).toHaveBeenCalledTimes(2);
    expect(mockGenerateInviteToken).toHaveBeenCalledTimes(1);
  });

  test("guards repeated confirmations while sending and permits retry after a failed request", async () => {
    let rejectRequest!: (error: Error) => void;
    mockGenerateInviteToken.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectRequest = reject;
      })
    );
    renderInvites();
    const { user, dialog } = await openResendConfirmation();
    const confirmButton = dialog.getByRole("button", { name: "Resend invite" });

    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    expect(mockGenerateInviteToken).toHaveBeenCalledTimes(1);
    expect(
      dialog.getByRole("button", { name: "Sending invite…" })
    ).toHaveAttribute("aria-disabled", "true");
    await user.click(dialog.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await act(async () => rejectRequest(new Error("request failed")));
    expect(
      dialog.getByText("Unable to resend the invite. Please try again.")
    ).toBeInTheDocument();
    expect(
      dialog.getByRole("button", { name: "Resend invite" })
    ).not.toHaveAttribute("aria-disabled", "true");

    mockGenerateInviteToken.mockResolvedValueOnce(generatedInvite);
    await user.click(dialog.getByRole("button", { name: "Resend invite" }));
    expect(dialog.getByText(inviteLink)).toBeInTheDocument();
    expect(mockGenerateInviteToken).toHaveBeenCalledTimes(2);
  });

  test("guards repeated clipboard clicks and recovers from clipboard failure without resending", async () => {
    mockGenerateInviteToken.mockResolvedValueOnce(generatedInvite);
    renderInvites();
    const { user, dialog, clipboard } = await openResendConfirmation();
    await user.click(dialog.getByRole("button", { name: "Resend invite" }));
    await user.click(dialog.getByRole("button", { name: "Done" }));

    let rejectCopy!: (error: Error) => void;
    clipboard.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectCopy = reject;
        })
    );
    const copyButton = screen.getByRole("button", { name: "Copy invite URL" });
    fireEvent.click(copyButton);
    fireEvent.click(copyButton);
    expect(clipboard).toHaveBeenCalledTimes(1);
    expect(copyButton).toHaveAttribute("aria-disabled", "true");

    await act(async () => rejectCopy(new Error("clipboard unavailable")));
    expect(
      screen.getByText("Unable to copy the invite URL. Please try again.")
    ).toBeInTheDocument();
    expect(copyButton).not.toHaveAttribute("aria-disabled", "true");
    clipboard.mockResolvedValueOnce(undefined);
    await user.click(copyButton);
    await waitFor(() =>
      expect(screen.getByText("URL copied!")).toBeInTheDocument()
    );
    expect(clipboard).toHaveBeenLastCalledWith(inviteLink);
    expect(mockGenerateInviteToken).toHaveBeenCalledTimes(1);
  });
});
