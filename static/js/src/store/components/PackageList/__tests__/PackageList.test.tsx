import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import { PackageList } from "../PackageList";

vi.mock("@canonical/store-components", () => ({
  CharmCard: () => <div>Charm</div>,
  Filters: () => <div>Filters</div>,
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

const renderList = (
  search = "",
  {
    type = "solutions",
    totalItems = 1,
    isFetching = false,
  }: {
    type?: "solutions" | "charms";
    totalItems?: number;
    isFetching?: boolean;
  } = {}
) =>
  render(
    <MemoryRouter initialEntries={[`/?type=${type}${search}`]}>
      <PackageList
        type={type}
        charms={[]}
        solutions={[solution]}
        counts={{ charms: 42, solutions: 1 }}
        countsFetching={{ charms: isFetching, solutions: isFetching }}
        totalItems={totalItems}
        resultCount={1}
        isFetching={isFetching}
        showSkeletons={isFetching}
      />
    </MemoryRouter>
  );

describe("PackageList", () => {
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
});
