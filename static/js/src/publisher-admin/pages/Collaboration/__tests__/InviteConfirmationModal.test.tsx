import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
import InviteConfirmationModal from "../InviteConfirmationModal";
import { useSendMutation, useRevokeMutation } from "../../../hooks";
import { useParams } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { Mock } from "vitest";

vi.mock("../../../hooks");
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: vi.fn(),
}));

const mockUseParams = useParams as Mock;
const mockUseSendMutation = useSendMutation as Mock;
const mockUseRevokeMutation = useRevokeMutation as Mock;

const queryClient = new QueryClient();

const sendMutation = vi.fn();
const revokeMutation = vi.fn();
const mockSetShowModal = vi.fn();
const mockSetShowSuccess = vi.fn();
const mockSetShowError = vi.fn();

const renderComponent = (props = {}) => {
  return render(
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <InviteConfirmationModal
          action="Resend"
          setShowModal={mockSetShowModal}
          setShowSuccess={mockSetShowSuccess}
          setShowError={mockSetShowError}
          queryKey="invitesData"
          {...props}
        />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

beforeEach(() => {
  mockUseParams.mockReturnValue({ packageName: "test-package" });

  mockUseSendMutation.mockReturnValue({
    mutate: sendMutation,
  });

  mockUseRevokeMutation.mockReturnValue({
    mutate: revokeMutation,
  });

  vi.clearAllMocks();
});

test("renders the modal with correct title and content for invites", () => {
  renderComponent({ action: "Revoke", queryKey: "invitesData" });

  expect(
    screen.getByRole("heading", { name: /Revoke invite/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Are you sure you want to revoke the invite/i)
  ).toBeInTheDocument();
});

test("renders the modal with correct title and content for collaborators", () => {
  renderComponent({ action: "Reopen", queryKey: "collaboratorsData" });

  expect(
    screen.getByRole("heading", { name: /Reopen collaborator/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Are you sure you want to reopen the collaborator/i)
  ).toBeInTheDocument();
});

test("closes the modal and resets the active invite email on Cancel button click", async () => {
  renderComponent();
  const user = userEvent.setup();

  const cancelButton = screen.getByRole("button", { name: /cancel/i });
  user.click(cancelButton);

  await waitFor(() => {
    expect(mockSetShowModal).toHaveBeenCalledWith(false);
    expect(mockSetShowModal).toHaveBeenCalledTimes(1);
    expect(mockSetShowSuccess).not.toHaveBeenCalled();
    expect(mockSetShowError).not.toHaveBeenCalled();
  });
});

test("performs send mutation on Reopen action", async () => {
  renderComponent({ action: "Reopen" });
  const user = userEvent.setup();

  const actionButton = screen.getByRole("button", { name: /reopen invite/i });
  user.click(actionButton);

  await waitFor(() => {
    expect(sendMutation).toHaveBeenCalled();
    expect(mockSetShowModal).toHaveBeenCalledWith(false);
  });
});

test("performs revoke mutation on Revoke action and updates collaborators list", async () => {
  renderComponent({ action: "Revoke" });
  const user = userEvent.setup();

  const actionButton = screen.getByRole("button", { name: /revoke invite/i });
  user.click(actionButton);

  await waitFor(() => {
    expect(revokeMutation).toHaveBeenCalled();
    expect(mockSetShowModal).toHaveBeenCalledWith(false);
  });
});
