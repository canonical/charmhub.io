import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { LandingPage } from "../LandingPage";

let intersectionObserverCallback: IntersectionObserverCallback;

class IntersectionObserverMock {
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    intersectionObserverCallback = callback;
  }
}

vi.mock("@canonical/store-components", () => ({
  CharmCard: ({ data }: { data: { package: { display_name: string } } }) => (
    <div>{data.package.display_name}</div>
  ),
  LoadingCard: () => <div>Loading charm</div>,
}));
vi.mock("../../Banner", () => ({
  default: () => <div>The Charm Collection</div>,
}));
const charm = {
  id: "mongodb",
  categories: [],
  package: {
    description: "A MongoDB operator charm",
    display_name: "MongoDB",
    name: "mongodb",
  },
  publisher: {
    display_name: "Canonical",
    name: "canonical",
  },
  ratings: { count: 0, value: 0 },
};

const renderLandingPage = (props: React.ComponentProps<typeof LandingPage>) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LandingPage {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("LandingPage", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          solutions: [
            {
              categories: ["security"],
              icon: null,
              last_updated: null,
              name: "identity-platform",
              platform: "kubernetes",
              publisher: "Identity Charmer",
              summary: "Composable identity platform",
              title: "Identity Platform Solution",
            },
          ],
        }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("renders the landing content, solutions, and charms", async () => {
    renderLandingPage({
      data: {
        categories: [],
        packages: [charm],
        total_items: 1,
        total_pages: 1,
      },
      isFetching: false,
      status: "success",
    });

    expect(
      screen.getByRole("heading", { name: "Explore Charms" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Discover Solutions" })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Identity Platform Solution")
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/solutions.json");
    expect(screen.getByText("MongoDB")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View all Charms/ })
    ).toHaveAttribute("href", "/?type=charm");
    expect(
      screen.getByRole("link", { name: /View all Solutions/ })
    ).toHaveAttribute("href", "/?type=solutions");
    expect(screen.getByRole("link", { name: "Charms" })).toHaveAttribute(
      "href",
      "#explore-charms"
    );
  });

  test("renders charm and solution loading cards", async () => {
    global.fetch = vi.fn(
      () => new Promise<Response>(() => {})
    ) as unknown as typeof fetch;
    renderLandingPage({
      isFetching: true,
      status: "loading",
    });

    await waitFor(() => {
      expect(screen.getAllByText("Loading charm")).toHaveLength(16);
    });
  });

  test("updates the active navigation link as sections are scrolled", () => {
    renderLandingPage({
      isFetching: false,
      status: "success",
    });
    const solutionsLink = screen.getByRole("link", { name: "Solutions" });
    const charmsLink = screen.getByRole("link", { name: "Charms" });
    const solutionsSection = document.getElementById("discover-solutions");
    const charmsSection = document.getElementById("explore-charms");

    expect(solutionsLink).toHaveAttribute("aria-current", "location");
    expect(solutionsLink).toHaveClass("is-active");

    act(() => {
      intersectionObserverCallback(
        [
          { isIntersecting: true, target: charmsSection },
        ] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(charmsLink).toHaveAttribute("aria-current", "location");
    expect(charmsLink).toHaveClass("is-active");
    expect(solutionsLink).not.toHaveAttribute("aria-current");
    expect(solutionsLink).not.toHaveClass("is-active");

    act(() => {
      intersectionObserverCallback(
        [
          { isIntersecting: true, target: solutionsSection },
        ] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(solutionsLink).toHaveAttribute("aria-current", "location");
    expect(solutionsLink).toHaveClass("is-active");
    expect(charmsLink).not.toHaveAttribute("aria-current");
    expect(charmsLink).not.toHaveClass("is-active");
  });

  test("leaves card sections empty when requests fail", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false } as Response) as unknown as typeof fetch;

    renderLandingPage({
      isFetching: false,
      status: "error",
    });

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Loading charm")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Solutions could not be loaded")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Charms could not be loaded")
    ).not.toBeInTheDocument();
  });
});
