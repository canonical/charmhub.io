import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import InviteCollaborator from "../InviteCollaborator";
import { RecoilObserver, QueryProvider } from "../../../utils";
import { activeInviteEmailState } from "../../../state/atoms";

const renderComponent = ({ event }: { event?: () => void }) => {
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
  test("disables 'Generate invite link' button if no email value", () => {
    renderComponent({});
    const component = screen.getByRole("button", {
      name: "Generate invite link",
    });
    expect(component).toHaveAttribute("aria-disabled", "true");
  });

  test("enables 'Generate invite link' button is there is an email value", async () => {
    renderComponent({});
    const componentInput = screen.getByLabelText("1. Email");
    const componentButton = screen.getByRole("button", {
      name: "Generate invite link",
    });
    const user = userEvent.setup();
    await user.type(componentInput, "john.doe@canonical.com");
    expect(componentButton).not.toBeDisabled();
  });

  test("changes active email address", async () => {
    const oninput = jest.fn();
    renderComponent({ event: oninput });
    const component = screen.getByLabelText("1. Email");
    const user = userEvent.setup();
    await user.type(component, "john.doe@canonical.com");
    expect(oninput).toHaveBeenCalledWith("john.doe@canonical.com");
  });
});
