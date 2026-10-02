import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Packages from "../Packages";
import "@testing-library/jest-dom";
import type { Solution } from "../../../types";

vi.mock("../../../components/LandingPage", () => ({
  LandingPage: () => <div>Explore Charms</div>,
}));
vi.mock("../../../components/PackageList", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../components/PackageList")>()),
  PackageList: ({
    type,
    solutions,
    totalItems,
  }: {
    type: string;
    solutions: Solution[];
    totalItems: number;
  }) => (
    <div>
      <div>Package list: {type}</div>
      <div>Matching results: {totalItems}</div>
      {solutions.map((solution) => (
        <div key={solution.name}>{solution.title}</div>
      ))}
    </div>
  ),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
};

const renderPackages = (initialEntry = "/") => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Packages />
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Packages component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn(() => new Promise<Response>(() => {}));
  });

  test("renders Explore Charms on the landing page", async () => {
    renderPackages();
    await waitFor(() => {
      expect(screen.getByText("Explore Charms")).toBeInTheDocument();
    });
    expect(globalThis.fetch).not.toHaveBeenCalledWith("/solutions.json");
  });

  test("renders the solutions package list page", async () => {
    renderPackages("/?type=solutions");

    expect(screen.getByText("Package list: solutions")).toBeInTheDocument();
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("/store.json?type=charm");
      expect(globalThis.fetch).toHaveBeenCalledWith("/solutions.json");
    });
  });

  test("renders the charms package list page", async () => {
    renderPackages("/?type=charms");

    expect(screen.getByText("Package list: charms")).toBeInTheDocument();
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("/store.json?type=charm");
    });
  });

  test("prepares filtered and paginated solutions for the listing", async () => {
    const solutions = Array.from({ length: 13 }, (_, index) => ({
      name: `identity-${index}`,
      title: `Identity ${index}`,
      publisher: "Canonical",
      summary: "Identity platform",
      categories: ["Security"],
      platform: "machine",
    }));
    globalThis.fetch = vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url === "/solutions.json"
              ? {
                  solutions: [
                    ...solutions,
                    {
                      ...solutions[0],
                      name: "other",
                      title: "Other solution",
                      summary: "Unrelated",
                      platform: "kubernetes",
                    },
                  ],
                }
              : {
                  packages: [],
                  categories: [],
                  total_items: 42,
                  total_pages: 4,
                }
          ),
      })
    );

    renderPackages(
      "/?type=solutions&q=identity&categories=Security&platforms=vm&page=2"
    );

    expect(await screen.findByText("Identity 5")).toBeInTheDocument();
    for (let index = 5; index < 10; index++) {
      expect(screen.getByText(`Identity ${index}`)).toBeInTheDocument();
    }
    expect(screen.getByText("Matching results: 13")).toBeInTheDocument();
    expect(screen.queryByText("Identity 0")).not.toBeInTheDocument();
    expect(screen.queryByText("Identity 10")).not.toBeInTheDocument();
    expect(screen.queryByText("Identity 12")).not.toBeInTheDocument();
    expect(screen.queryByText("Other solution")).not.toBeInTheDocument();
  });

  test.each([
    ["/?type=charm&q=kafka", "?type=charms&q=kafka"],
    ["/?type=bundle&q=kafka", "?type=charms&q=kafka"],
    ["/?type=all", "?type=charms"],
    ["/?q=kafka", "?q=kafka&type=charms"],
  ])("redirects %s to the charms tab", async (initialEntry, expected) => {
    renderPackages(initialEntry);

    expect(screen.getByText("Package list: charms")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(expected);
    });
  });
});
