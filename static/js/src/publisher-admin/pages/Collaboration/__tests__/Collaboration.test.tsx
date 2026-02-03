import { RecoilRoot, RecoilValue } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import Collaboration from "../Collaboration";
import {
  filteredCollaboratorsListState,
  filteredInvitesListState,
} from "../../../state/selectors";
import { RecoilObserver, QueryProvider } from "../../../utils";

const renderComponent = ({
  event,
  state,
}: {
  event: () => void;
  state: RecoilValue<unknown>;
}) => {
  return render(
    <RecoilRoot>
      <BrowserRouter>
        <QueryProvider>
          <RecoilObserver node={state} event={event} />
          <Collaboration />
        </QueryProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
};

describe("Collaboration", () => {
  test("sets collaborators data", async () => {
    const onload = jest.fn();
    renderComponent({ event: onload, state: filteredCollaboratorsListState });
    const component = await waitFor(() => screen.getByRole("grid"));
    expect(component).toBeInTheDocument();
    expect(onload).toHaveBeenCalled();
  });

  test("sets invites data", async () => {
    const onload = jest.fn();
    renderComponent({ event: onload, state: filteredInvitesListState });
    const component = await waitFor(() => screen.getByRole("grid"));
    expect(component).toBeInTheDocument();
    expect(onload).toHaveBeenCalled();
  });

  test("renders side panel when Add new collaborator is clicked", () => {
    renderComponent({
      event: jest.fn(),
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
      event: jest.fn(),
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
      event: jest.fn(),
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
