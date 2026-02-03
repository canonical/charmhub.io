import { BrowserRouter } from "react-router-dom";
import { MutableSnapshot, RecoilRoot } from "recoil";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import PubliciseBadges from "../PubliciseBadges";

import { packageDataState } from "../../../state/atoms";
import { mockPackage } from "../../../mocks";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
}));

const htmlSnippet = `<a href="https://charmhub.io/test-charm-name">
    <img alt="" src="https://charmhub.io/test-charm-name/badge.svg" />
</a>`;

const markdownSnippet =
  "[![Test charm name](https://charmhub.io/test-charm-name/badge.svg)](https://charmhub.io/test-charm-name)";

const renderComponent = () => {
  render(
    <RecoilRoot
      initializeState={(snapshot: MutableSnapshot) => {
        return snapshot.set(packageDataState, mockPackage);
      }}
    >
      <BrowserRouter>
        <PubliciseBadges />
      </BrowserRouter>
    </RecoilRoot>
  );
};

describe("PubliciseBadges", () => {
  test("renders a GitHub badge", () => {
    renderComponent();
    expect(
      screen.getByAltText("test-charm-name GitHub badge")
    ).toBeInTheDocument();
  });

  test("renders the correct HTML snippet", () => {
    renderComponent();
    expect(
      screen.getByText(htmlSnippet, { collapseWhitespace: false })
    ).toBeInTheDocument();
  });

  test("renders the correct markdown snippet", () => {
    renderComponent();
    expect(screen.getByText(markdownSnippet)).toBeInTheDocument();
  });
});
