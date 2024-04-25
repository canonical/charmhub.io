import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import PubliciseButtons from "../PubliciseButtons";

import { languages } from "../../../utils";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
}));

const getBlackButtonHtmlSnippet = (language: string) => {
  return `<a href="https://charmhub.io/test-charm-steve">
  <img alt="" src="https://charmhub.io/static/images/badges/${language}/charmhub-black.svg" />
</a>`;
};

const getWhiteButtonHtmlSnippet = (language: string) => {
  return `<a href="https://charmhub.io/test-charm-steve">
  <img alt="" src="https://charmhub.io/static/images/badges/${language}/charmhub-white.svg" />
</a>`;
};

const getBlackButtonMarkdownSnippet = (language: string) => {
  return `[![Get it from the Charmhub](https://charmhub.io/static/images/badges/${language}/charmhub-black.svg)](https://charmhub.io/test-charm-steve)`;
};

const getWhiteButtonMarkdownSnippet = (language: string) => {
  return `[![Get it from the Charmhub](https://charmhub.io/static/images/badges/${language}/charmhub-white.svg)](https://charmhub.io/test-charm-steve)`;
};

const renderComponent = () => {
  render(
    <BrowserRouter>
      <PubliciseButtons />
    </BrowserRouter>
  );
};

describe("PubliciseButtons", () => {
  test("english is selected by default", () => {
    renderComponent();
    expect(screen.getByLabelText("Language:")).toHaveValue("en");
  });

  test("shows correct HTML snippet for black buttons for each language when selected", () => {
    const user = userEvent.setup();
    renderComponent();

    Object.keys(languages).forEach(async (language) => {
      await user.selectOptions(screen.getByLabelText("Language:"), [
        languages[language].title,
      ]);
      expect(
        screen.getByText(getBlackButtonHtmlSnippet(language), {
          collapseWhitespace: false,
        })
      ).toBeInTheDocument();
    });
  });

  test("shows correct HTML snippet for white buttons for each language when selected", () => {
    const user = userEvent.setup();
    renderComponent();

    Object.keys(languages).forEach(async (language) => {
      await user.selectOptions(screen.getByLabelText("Language:"), [
        languages[language].title,
      ]);
      expect(
        screen.getByText(getWhiteButtonHtmlSnippet(language), {
          collapseWhitespace: false,
        })
      ).toBeInTheDocument();
    });
  });

  test("shows correct Markdown snippet for black buttons for each language when selected", () => {
    const user = userEvent.setup();
    renderComponent();

    Object.keys(languages).forEach(async (language) => {
      await user.selectOptions(screen.getByLabelText("Language:"), [
        languages[language].title,
      ]);
      expect(
        screen.getByText(getBlackButtonMarkdownSnippet(language), {
          collapseWhitespace: false,
        })
      ).toBeInTheDocument();
    });
  });

  test("shows correct Markdown snippet for white buttons for each language when selected", () => {
    const user = userEvent.setup();
    renderComponent();

    Object.keys(languages).forEach(async (language) => {
      await user.selectOptions(screen.getByLabelText("Language:"), [
        languages[language].title,
      ]);
      expect(
        screen.getByText(getWhiteButtonMarkdownSnippet(language), {
          collapseWhitespace: false,
        })
      ).toBeInTheDocument();
    });
  });
});
