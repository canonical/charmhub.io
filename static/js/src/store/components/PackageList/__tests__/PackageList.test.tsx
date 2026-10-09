import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import { PackageList } from "../PackageList";

vi.mock("@canonical/store-components", () => ({
  CharmCard: () => <div>Charm</div>,
  Filters: ({ categories }: { categories: { display_name: string }[] }) => (
    <div>
      Filters
      {categories.map(({ display_name }) => (
        <span key={display_name}>{display_name}</span>
      ))}
    </div>
  ),
  LoadingCard: () => <div>Loading</div>,
  SolutionCard: ({ data }: { data: { title: string } }) => (
    <div>{data.title}</div>
  ),
  SolutionLoadingCard: () => <div>Loading solution</div>,
}));

const solution = {
  categories: ["security"],
  charms: [],
  icon: null,
  last_updated: null,
  name: "identity",
  platform: "kubernetes",
  platform_version: [],
  publisher: "Canonical",
  summary: "Identity platform",
  title: "Identity Platform",
};

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
};

const renderList = (
  search = "",
  {
    type = "solutions",
    totalItems = 1,
    isFetching = false,
    counts = { charms: 42, solutions: 1 },
    countsFetching = { charms: isFetching, solutions: isFetching },
    countsReady = true,
  }: {
    type?: "solutions" | "charms";
    totalItems?: number;
    isFetching?: boolean;
    counts?: { charms: number; solutions: number };
    countsFetching?: { charms: boolean; solutions: boolean };
    countsReady?: boolean;
  } = {}
) =>
  render(
    <MemoryRouter initialEntries={[`/?type=${type}${search}`]}>
      <PackageList
        type={type}
        charms={[]}
        solutions={totalItems === 0 ? [] : [solution]}
        categories={[
          { name: "logging-tracing", display_name: "Logging and Tracing" },
          { name: "big-data", display_name: "Big Data" },
        ]}
        counts={counts}
        countsFetching={countsFetching}
        countsReady={countsReady}
        totalItems={totalItems}
        resultCount={totalItems === 0 ? 0 : 1}
        isFetching={isFetching}
        showSkeletons={isFetching}
      />
      <LocationDisplay />
    </MemoryRouter>
  );

describe("PackageList", () => {
  test("passes API category labels to the filters unchanged", () => {
    renderList();

    expect(screen.getByText("Logging and Tracing")).toBeInTheDocument();
    expect(screen.getByText("Big Data")).toBeInTheDocument();
  });

  test.each([
    ["", ""],
    ["&platforms=vm", "1 platform"],
    ["&categories=security,storage", "2 categories"],
    ["&categories=security&platforms=vm,kubernetes", "3 filters"],
    ["&q=identity", "identity"],
    ["&q=identity&platforms=vm", ""],
  ])("summarises results for '%s'", (search, context) => {
    renderList(search);

    const summary = screen.getByText(/^Showing 1 result of 1/);
    expect(summary.textContent).toBe(
      `Showing 1 result of 1${context ? ` for ${context}` : ""}`
    );
    if (context) {
      expect(within(summary).getByText(context).tagName).toBe("STRONG");
    }
  });

  test("shows the clear button label based on search and filters", () => {
    const { unmount } = renderList("&q=identity");
    expect(
      screen.getByRole("button", { name: "Clear search" })
    ).toBeInTheDocument();
    unmount();

    renderList("&q=identity&platforms=vm");
    expect(
      screen.getByRole("button", { name: "Clear search & filter" })
    ).toBeInTheDocument();
  });

  test("renders solutions with tab links that keep search and filters but not page", () => {
    renderList("&q=identity&platforms=vm&categories=security&page=2");

    expect(screen.getByText("Identity Platform")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Solutions/ })).toHaveAttribute(
      "href",
      "/?type=solutions&platforms=vm&categories=security&q=identity"
    );
    expect(screen.getByRole("link", { name: /Charms/ })).toHaveAttribute(
      "href",
      "/?type=charms&platforms=vm&categories=security&q=identity"
    );
  });

  test.each([
    ["solutions", 13, "3"],
    ["charms", 42, "4"],
  ] as const)("paginates %s by its page size", (type, totalItems, last) => {
    renderList("", { type, totalItems });

    const pagination = within(
      screen.getByRole("navigation", { name: "Pagination" })
    );
    expect(pagination.getByText(last)).toBeInTheDocument();
    expect(pagination.queryByText(String(Number(last) + 1))).toBeNull();
  });

  test("shows loading states while fetching", () => {
    renderList("", { type: "charms", isFetching: true });

    expect(screen.getByText("Loading results...")).toBeInTheDocument();
    expect(screen.getAllByText("Loading")).toHaveLength(12);
    expect(screen.getByLabelText("Loading charms count")).toBeInTheDocument();
    expect(screen.queryByText(/results of/)).not.toBeInTheDocument();
  });

  describe("empty results", () => {
    test("offers related charms when the solutions search is empty", () => {
      renderList("&q=Identity&page=2", {
        type: "solutions",
        totalItems: 0,
        counts: { charms: 3, solutions: 0 },
      });

      expect(
        screen.getByRole("heading", { name: "No solutions found" })
      ).toBeVisible();
      expect(
        screen.getByText("Identity", { selector: "strong" })
      ).toBeVisible();
      expect(
        screen.getByText(/but we found charms matching your search/)
      ).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Explore 3 related charms" })
      ).toHaveAttribute("href", "/?type=charms&q=Identity");
      expect(
        screen.queryByRole("button", { name: "Clear search & filters" })
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/^Showing/)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("navigation", { name: "Pagination" })
      ).not.toBeInTheDocument();
    });

    test("offers related solutions when the charms search is empty", () => {
      renderList("&q=Identity&page=2", {
        type: "charms",
        totalItems: 0,
        counts: { charms: 0, solutions: 3 },
      });

      expect(
        screen.getByRole("heading", { name: "No charms found" })
      ).toBeVisible();
      expect(
        screen.getByText(/but we found solutions matching your search/)
      ).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Explore 3 related solutions" })
      ).toHaveAttribute("href", "/?type=solutions&q=Identity");
    });

    test("offers to clear filters when there is no search query", async () => {
      const user = userEvent.setup();
      renderList("&categories=security&platforms=vm&page=2", {
        type: "solutions",
        totalItems: 0,
        counts: { charms: 3, solutions: 0 },
      });

      expect(
        screen.getByRole("link", { name: "Explore 3 related charms" })
      ).toHaveAttribute(
        "href",
        "/?type=charms&platforms=vm&categories=security"
      );
      const fallback = screen.getByRole("heading", {
        name: "No solutions found",
      }).parentElement!;
      await user.click(
        within(fallback).getByRole("button", { name: "Clear all filters" })
      );

      expect(screen.getByTestId("location")).toHaveTextContent(
        "?type=solutions"
      );
    });

    test("offers all solutions when neither tab matches the search", () => {
      renderList("&q=Identity&page=2", {
        type: "solutions",
        totalItems: 0,
        counts: { charms: 0, solutions: 0 },
      });

      expect(screen.getByText(/solutions or charms in Charmhub/)).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Browse all solutions" })
      ).toHaveAttribute("href", "/?type=solutions");
      expect(
        screen.queryByRole("link", { name: /Explore/ })
      ).not.toBeInTheDocument();
    });

    test("offers all charms when neither tab matches the search and filters", () => {
      renderList("&q=Identity&categories=security&platforms=vm&page=2", {
        type: "charms",
        totalItems: 0,
        counts: { charms: 0, solutions: 0 },
      });

      expect(screen.getByText(/charms or solutions in Charmhub/)).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Browse all charms" })
      ).toHaveAttribute("href", "/?type=charms");
    });

    test("shows publishing resources in the charms fallback", () => {
      renderList("&q=Identity", {
        type: "charms",
        totalItems: 0,
        counts: { charms: 0, solutions: 0 },
      });

      expect(
        screen.getByRole("link", { name: "Publish it to Charmhub" })
      ).toBeVisible();
      expect(screen.getByRole("link", { name: "Juju docs" })).toBeVisible();
      expect(screen.getByRole("link", { name: "Ops" })).toBeVisible();
      expect(screen.getByRole("link", { name: "Charmcraft" })).toBeVisible();
    });
  });
});
