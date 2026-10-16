import type { Atom } from "jotai";
import { BrowserRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { add } from "date-fns";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import Collaboration from "../Collaboration";
import {
  filteredCollaboratorsListState,
  filteredInvitesListState,
} from "../../../state/selectors";
import { QueryProvider } from "../../../utils";
import JotaiObserver from "../../../../test-utils/JotaiObserver";
import JotaiTestProvider from "../../../../test-utils/JotaiTestProvider";
import { invitesListState } from "../../../state/atoms";
import type { Invite } from "../../../types";

const renderComponent = ({
  event,
  state,
}: {
  event: () => void;
  state: Atom<unknown>;
}) => {
  return render(
    <JotaiTestProvider>
      <BrowserRouter>
        <QueryProvider>
          <JotaiObserver atom={state} event={event} />
          <Collaboration />
        </QueryProvider>
      </BrowserRouter>
    </JotaiTestProvider>
  );
};

describe("Collaboration", () => {
  test("keeps the invite count aligned with displayed rows and filtering", async () => {
    const baseInvite: Invite = {
      "accepted-at": null,
      "created-at": "2024-01-01",
      "created-by": {
        "display-name": "John Doe",
        email: "john.doe@canonical.com",
        id: "publisher-id",
        username: "johndoe",
      },
      email: "pending@example.com",
      "expires-at": add(new Date(), { days: 1 }).toISOString(),
      "invite-type": "package-collaborator",
      "revoked-at": null,
    };
    const revokedInvite = {
      ...baseInvite,
      email: "revoked@example.com",
      "revoked-at": new Date().toISOString(),
    };
    const invites: Invite[] = [
      baseInvite,
      {
        ...baseInvite,
        email: "accepted@example.com",
        "accepted-at": new Date().toISOString(),
      },
      {
        ...baseInvite,
        email: "expired@example.com",
        "expires-at": "2020-01-01T00:00:00Z",
      },
      revokedInvite,
      { ...revokedInvite },
      { ...baseInvite, email: "other@example.com" },
    ];
    const queryClient = new QueryClient({
      defaultOptions: { queries: { enabled: false } },
    });
    const user = userEvent.setup();

    render(
      <JotaiTestProvider initialValues={[[invitesListState, invites]]}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <Collaboration />
          </QueryClientProvider>
        </BrowserRouter>
      </JotaiTestProvider>
    );

    await user.click(screen.getByRole("button", { name: "Invites (4)" }));

    const table = screen.getByRole("grid");
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(within(table).getByText("Pending").closest("td")).toHaveAttribute(
      "rowspan",
      "2"
    );
    expect(within(table).getByText("Expired")).toBeInTheDocument();
    expect(within(table).getByText("Revoked")).toBeInTheDocument();
    expect(
      within(table).queryByText("accepted@example.com")
    ).not.toBeInTheDocument();
    expect(within(table).getAllByText("revoked@example.com")).toHaveLength(1);

    await user.type(screen.getByRole("searchbox"), "pending@example.com");

    expect(
      screen.getByRole("button", { name: "Invites (1)" })
    ).toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText("pending@example.com")).toBeInTheDocument();
    expect(within(table).getByText("Pending").closest("td")).toHaveAttribute(
      "rowspan",
      "1"
    );
  });

  test("sets collaborators data", async () => {
    const onload = vi.fn();
    renderComponent({ event: onload, state: filteredCollaboratorsListState });
    const component = await waitFor(() => screen.getByRole("grid"));
    expect(component).toBeInTheDocument();
    expect(onload).toHaveBeenCalled();
  });

  test("sets invites data", async () => {
    const onload = vi.fn();
    renderComponent({ event: onload, state: filteredInvitesListState });
    const component = await waitFor(() => screen.getByRole("grid"));
    expect(component).toBeInTheDocument();
    expect(onload).toHaveBeenCalled();
  });

  test("renders side panel when Add new collaborator is clicked", () => {
    renderComponent({
      event: vi.fn(),
      state: filteredCollaboratorsListState,
    });
    const user = userEvent.setup();

    const button = screen.getByRole("button", {
      name: /Add new collaborator/i,
    });
    user.click(button);

    expect(screen.getByRole("complementary")).toBeVisible();
  });

  test("closes side panel when overlay is clicked", () => {
    renderComponent({
      event: vi.fn(),
      state: filteredCollaboratorsListState,
    });
    const user = userEvent.setup();

    const openButton = screen.getByRole("button", {
      name: /Add new collaborator/i,
    });
    user.click(openButton);

    const overlay = screen.getByRole("button", { name: /close side panel/i });
    user.click(overlay);

    expect(screen.getByRole("complementary")).toHaveClass("is-collapsed");
  });

  test("closes side panel when Escape key is pressed", async () => {
    renderComponent({
      event: vi.fn(),
      state: filteredCollaboratorsListState,
    });
    const user = userEvent.setup();

    const openButton = screen.getByRole("button", {
      name: /add new collaborator/i,
    });
    await user.click(openButton);

    const aside = screen.getByRole("complementary");
    expect(aside).not.toHaveClass("is-collapsed");

    const overlay = screen.getByLabelText(/close side panel/i);
    overlay.focus();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.getByRole("complementary")).toHaveClass("is-collapsed");
    });
  });
});
