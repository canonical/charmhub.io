import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import { PackageList } from "../PackageList";

vi.mock("@canonical/store-components", () => ({
  CharmCard: ({ data }: { data: { package: { display_name: string } } }) => (
    <div>{data.package.display_name}</div>
  ),
  Filters: () => <div>Filters</div>,
  LoadingCard: () => <div>Loading</div>,
  SolutionCard: ({ data }: { data: { title: string } }) => (
    <div data-testid="solution-card">{data.title}</div>
  ),
  SolutionLoadingCard: () => <div>Loading solution</div>,
}));

const solution = {
  categories: ["Security"],
  charms: ["identity-platform", "postgresql-k8s"],
  icon: null,
  last_updated: "2026-08-01T00:00:00Z",
  name: "identity-platform-solution",
  platform: "kubernetes",
  platform_version: [">= 1.25"],
  publisher: "Identity Charmer",
  summary: "Composable identity platform",
  title: "Identity Platform Solution",
};

const renderList = (
  initialEntry = "/?type=solutions",
  type: "solutions" | "charms" = "solutions",
  totalItems = 1
) => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PackageList
        charms={[]}
        solutions={[solution]}
        counts={{ charms: 42, solutions: 1 }}
        totalItems={totalItems}
        resultCount={1}
        isFetching={false}
        showSkeletons={false}
        type={type}
      />
    </MemoryRouter>
  );
};

describe("PackageList", () => {
  test.each([
    ["solutions", 13, "3", "4"],
    ["charms", 42, "4", "5"],
  ] as const)(
    "uses the %s page size for pagination",
    (type, total, last, next) => {
      renderList(`/?type=${type}`, type, total);

      const pagination = within(
        screen.getByRole("navigation", { name: "Pagination" })
      );
      expect(pagination.getByText(last)).toBeInTheDocument();
      expect(pagination.queryByText(next)).not.toBeInTheDocument();
    }
  );

  test("renders solution results and both tabs", async () => {
    renderList();

    expect(await screen.findByTestId("solution-card")).toHaveTextContent(
      "Identity Platform Solution"
    );
    expect(screen.getByRole("link", { name: /Solutions/ })).toHaveAttribute(
      "href",
      "/?type=solutions"
    );
    expect(screen.getByRole("link", { name: /Charms/ })).toHaveAttribute(
      "href",
      "/?type=charms"
    );
  });

  test("tab links preserve platforms and categories but not search or pagination", () => {
    renderList(
      "/?type=solutions&q=identity&platforms=vm&categories=security&page=2"
    );

    expect(screen.getByRole("link", { name: /Solutions/ })).toHaveAttribute(
      "href",
      "/?type=solutions&platforms=vm&categories=security"
    );
    expect(screen.getByRole("link", { name: /Charms/ })).toHaveAttribute(
      "href",
      "/?type=charms&platforms=vm&categories=security"
    );
  });

  test("shows a results count placeholder while charms are loading", () => {
    render(
      <MemoryRouter initialEntries={["/?type=charms"]}>
        <PackageList
          charms={[]}
          solutions={[]}
          counts={{ charms: 0, solutions: 0 }}
          totalItems={0}
          resultCount={0}
          isFetching={true}
          showSkeletons={true}
          type="charms"
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading results...")).toBeInTheDocument();
    expect(screen.queryByText(/results of/)).not.toBeInTheDocument();
  });
});
