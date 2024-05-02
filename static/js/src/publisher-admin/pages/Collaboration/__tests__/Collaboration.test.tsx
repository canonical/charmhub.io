import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Collaboration from "../Collaboration";
import {
  filteredCollaboratorsListState,
  filteredInvitesListState,
} from "../../../state/selectors";
import { RecoilObserver, QueryProvider } from "../../../utils";

const renderComponent = ({ event, state }: { event: Function; state: any }) => {
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
  it("sets collaborators data", async () => {
    const onload = jest.fn();
    renderComponent({ event: onload, state: filteredCollaboratorsListState });
    const component = await waitFor(() => screen.getByRole("grid"));
    expect(component).toBeInTheDocument();
    expect(onload).toHaveBeenCalled();
  });

  it("sets invites data", async () => {
    const onload = jest.fn();
    renderComponent({ event: onload, state: filteredInvitesListState });
    const component = await waitFor(() => screen.getByRole("grid"));
    expect(component).toBeInTheDocument();
    expect(onload).toHaveBeenCalled();
  });
});
