import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import CollaboratorFilter from "../CollaboratorFilter";
import { filterQueryState } from "../../../state/atoms";
import { RecoilObserver, QueryProvider } from "../../../utils";

let mockSearchParams = { filter: "" };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: () => [new URLSearchParams(mockSearchParams), jest.fn()],
}));

const renderComponent = ({
  event,
  filterQuery,
}: {
  event?: Function;
  filterQuery?: string;
}) => {
  mockSearchParams.filter = filterQuery || "";

  return render(
    <RecoilRoot>
      <BrowserRouter>
        <QueryProvider>
          <RecoilObserver node={filterQueryState} event={event || jest.fn()} />
          <CollaboratorFilter />
        </QueryProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
};

const searchInputLabel = "Search collaborators";

describe("CollaboratorFilter", () => {
  it("displays an empty input if no filter query string exists", () => {
    renderComponent({ filterQuery: "" });
    const component = screen.getByLabelText(searchInputLabel);
    expect(component).toHaveValue("");
  });

  it("displays filter query string value in input if it exists", () => {
    renderComponent({ filterQuery: "testing" });
    const component = screen.getByLabelText(searchInputLabel);
    expect(component).toHaveValue("testing");
  });
});
