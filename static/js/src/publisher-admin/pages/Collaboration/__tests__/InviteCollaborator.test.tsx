import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import InviteCollaborator from "../InviteCollaborator";
import { RecoilObserver, QueryProvider } from "../../../utils";
import { activeInviteEmailState } from "../../../state/atoms";

global.window.CSRF_TOKEN = "test-csrf-token";

jest.mock("../../../utils/generateInviteToken", () => ({
  generateInviteToken: jest.fn(),
}));

import { generateInviteToken } from "../../../utils/generateInviteToken";
const mockGenerateInviteToken = generateInviteToken as jest.Mock;

const renderComponent = ({ event }: { event?: () => void } = {}) => {
  return render(
    <RecoilRoot>
      <BrowserRouter>
        <QueryProvider>
          <RecoilObserver
            node={activeInviteEmailState}
            event={event || jest.fn()}
          />
          <InviteCollaborator
            setShowSidePanel={jest.fn()}
            setShowInviteSuccess={jest.fn()}
            setShowInviteError={jest.fn()}
          />
        </QueryProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
};

describe("InviteCollaborator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("disables 'Send invite' button if no email", () => {
    renderComponent();
    const button = screen.getByRole("button", {
      name: /send invite/i,
    });
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  test("enables 'Send invite' when a valid email is typed", async () => {
    renderComponent();
    const input = screen.getByLabelText(/1\. Email/i);
    const button = screen.getByRole("button", {
      name: /send invite/i,
    });

    const user = userEvent.setup();
    await user.type(input, "john.doe@canonical.com");

    expect(button).toBeEnabled();
  });

  test("shows spinner when generating link", async () => {
    const delay = () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ inviteLink: "https://example" }), 500)
      );

    mockGenerateInviteToken.mockImplementation(() => delay());

    renderComponent();
    const input = screen.getByLabelText(/1\. Email/i);
    const user = userEvent.setup();
    await user.type(input, "john.doe@canonical.com");

    user.click(screen.getByRole("button", { name: /send invite/i }));

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  test("displays invite link when generated", async () => {
    mockGenerateInviteToken.mockResolvedValueOnce({
      inviteLink: "https://example.com/invite?token=test-token",
    });

    renderComponent();
    const input = screen.getByLabelText(/1\. Email/i);
    const user = userEvent.setup();
    await user.type(input, "john.doe@canonical.com");

    user.click(screen.getByRole("button", { name: /send invite/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/https:\/\/example.com\/invite\?token=test-token/i)
      ).toBeInTheDocument();
    });
  });

  test("resets invite link if email is changed", async () => {
    mockGenerateInviteToken.mockResolvedValueOnce({
      inviteLink: "https://example.com/invite?token=test-token",
    });

    renderComponent();
    const input = screen.getByLabelText(/1\. Email/i);
    const user = userEvent.setup();

    await user.type(input, "john.doe@canonical.com");
    user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/https:\/\/example.com\/invite\?token=test-token/i)
      ).toBeInTheDocument();
    });

    await user.clear(input);
    await user.type(input, "jane.doe@canonical.com");

    expect(
      screen.getByText(/enter email to generate a unique invitation link/i)
    ).toBeInTheDocument();
  });
});
