import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import Publicise from "../Publicise";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
}));

const renderComponent = () => {
  render(
    <RecoilRoot>
      <BrowserRouter>
        <Publicise />
      </BrowserRouter>
    </RecoilRoot>
  );
};

describe("Publicise", () => {
  test("shows buttons page", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Charmhub buttons"));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Promote your charm using Charmhub buttons"
    );
  });

  test("shows badges page", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("GitHub badges"));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Promote your charm using an embeddable GitHub badge"
    );
  });

  test("shows embeddable cards page", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Embeddable cards"));

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Promote your charm using embeddable responsive card"
    );
  });
});
