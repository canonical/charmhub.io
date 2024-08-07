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
  it("disables 'Add collaborator' button if no email value", () => {
    renderComponent({});
    const component = screen.getByRole("button", { name: "Add collaborator" });
    expect(component).toHaveAttribute("aria-disabled", "true");
  });

  it("enables 'Add collaborator' button is there is an email value", async () => {
    renderComponent({});
    const componentInput = screen.getByLabelText("Email");
    const componentButton = screen.getByRole("button", {
      name: "Add collaborator",
    });
    const user = userEvent.setup();
    await user.type(componentInput, "john.doe@canonical.com");
    expect(componentButton).not.toBeDisabled();
  });

  it("changes active email address", async () => {
    const oninput = jest.fn();
    renderComponent({ event: oninput });
    const component = screen.getByLabelText("Email");
    const user = userEvent.setup();
    await user.type(component, "john.doe@canonical.com");
    expect(oninput).toHaveBeenCalledWith("john.doe@canonical.com");
  });
});
