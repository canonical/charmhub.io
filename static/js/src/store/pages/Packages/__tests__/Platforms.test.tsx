import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import Packages from "../Packages";

vi.mock("@canonical/store-components", async (importOriginal) => ({
  Filters: (
    await importOriginal<typeof import("@canonical/store-components")>()
  ).Filters,
  SolutionCard: ({ data }: { data: { title: string } }) => (
    <div>{data.title}</div>
  ),
  CharmCard: ({ data }: { data: { package: { display_name: string } } }) => (
    <div>{data.package.display_name}</div>
  ),
  SolutionLoadingCard: () => <div>Loading solution</div>,
  LoadingCard: () => <div>Loading charm</div>,
}));
vi.mock("../../../components/LandingPage", () => ({
  LandingPage: () => <div>Landing page</div>,
}));

const Location = () => <div data-testid="location">{useLocation().search}</div>;

const renderPackages = (entry: string) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <Packages />
        <Location />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return userEvent.setup();
};

describe("shared platform filters", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const params = new URL(url, "https://charmhub.io").searchParams;
        const platform = params.get("platforms");
        return {
          ok: true,
          json: async () =>
            url === "/solutions.json"
              ? {
                  solutions: [
                    {
                      name: "machine",
                      title: "Machine solution",
                      platform: "machine",
                      categories: [],
                    },
                    {
                      name: "k8s",
                      title: "Kubernetes solution",
                      platform: "kubernetes",
                      categories: [],
                    },
                    {
                      name: "unknown",
                      title: "Other solution",
                      platform: "",
                      categories: [],
                    },
                  ],
                }
              : {
                  packages: [
                    { package: { display_name: `${platform || "All"} charm` } },
                  ],
                  categories: [],
                  total_items:
                    platform === "kubernetes" ? 7 : platform === "vm" ? 11 : 18,
                  total_pages: 2,
                },
        };
      })
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  test.each(["solutions", "charms"])(
    "keeps all categories visible and updates both tabs from %s",
    async (type) => {
      const solutions = [
        {
          name: "database",
          title: "Database solution",
          categories: [{ slug: "databases", name: "Databases" }],
          platform: "kubernetes",
        },
        {
          name: "storage",
          title: "Storage solution",
          categories: ["storage"],
          platform: "kubernetes",
        },
        {
          name: "both",
          title: "Multi-category solution",
          categories: ["databases", "storage"],
          platform: "kubernetes",
        },
        {
          name: "machine",
          title: "Machine solution",
          categories: ["storage"],
          platform: "machine",
        },
      ];
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          const params = new URL(url, "https://charmhub.io").searchParams;
          const selected = params.get("categories")?.split(",") || [];
          const matches = solutions.filter(
            (solution) =>
              (!params.get("platforms") ||
                solution.platform === params.get("platforms")) &&
              (!selected.length ||
                solution.categories.some((category) =>
                  selected.includes(
                    typeof category === "string" ? category : category.slug
                  )
                ))
          );
          return {
            ok: true,
            json: async () =>
              url === "/solutions.json"
                ? { solutions }
                : {
                    packages: matches.map((solution) => ({
                      package: { display_name: `${solution.name} charm` },
                    })),
                    total_items: matches.length,
                    total_pages: 1,
                    categories: [],
                  },
          };
        })
      );
      const user = renderPackages(`/?type=${type}&platforms=kubernetes&page=2`);
      const labels = [
        "AI/ML",
        "Big Data",
        "Cloud",
        "Containers",
        "Databases",
        "Logging & Tracing",
        "Monitoring",
        "Networking",
        "Security",
        "Storage",
      ];
      for (const name of labels)
        expect(screen.getByRole("checkbox", { name })).toBeInTheDocument();
      await screen.findByRole("link", { name: "Charms 3" });

      await user.click(screen.getByRole("checkbox", { name: "Databases" }));
      await screen.findByRole("link", { name: "Solutions 2" });
      await screen.findByRole("link", { name: "Charms 2" });
      expect(screen.getByTestId("location")).not.toHaveTextContent("page=");
      await user.click(screen.getByRole("checkbox", { name: "Storage" }));
      await screen.findByRole("link", { name: "Solutions 3" });
      await screen.findByRole("link", { name: "Charms 3" });

      await user.click(
        screen.getByRole("link", {
          name: type === "solutions" ? "Charms 3" : "Solutions 3",
        })
      );
      expect(screen.getByRole("checkbox", { name: "Databases" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Storage" })).toBeChecked();
      expect(
        screen.getByRole("checkbox", { name: "Kubernetes (K8s)" })
      ).toBeChecked();

      await user.click(screen.getByRole("checkbox", { name: "Databases" }));
      await screen.findByRole("link", { name: "Charms 2" });
      await user.click(screen.getByRole("checkbox", { name: "Storage" }));
      await screen.findByRole("link", { name: "Charms 3" });
      await user.click(screen.getByRole("checkbox", { name: "Security" }));
      await screen.findByRole("link", { name: "Solutions 0" });
      await screen.findByRole("link", { name: "Charms 0" });
      expect(screen.getByText("No results found.")).toBeInTheDocument();
      for (const name of labels)
        expect(screen.getByRole("checkbox", { name })).toBeInTheDocument();
    }
  );

  test.each(["solutions", "charms"])(
    "updates both counts and preserves selection when starting on %s",
    async (type) => {
      const user = renderPackages(`/?type=${type}&page=2`);
      await screen.findByRole("link", { name: "Solutions 3" });
      await screen.findByRole("link", { name: "Charms 18" });
      if (type === "solutions") {
        expect(fetch).toHaveBeenCalledWith("/store.json?type=charm");
      }

      await user.click(
        screen.getByRole("checkbox", { name: "Kubernetes (K8s)" })
      );

      await screen.findByRole("link", { name: "Solutions 1" });
      await screen.findByRole("link", { name: "Charms 7" });
      expect(fetch).toHaveBeenCalledWith(
        "/store.json?type=charm&platforms=kubernetes"
      );
      expect(screen.getByTestId("location")).not.toHaveTextContent("page=");
      expect(screen.queryByText("Machine solution")).not.toBeInTheDocument();
      const otherType = type === "solutions" ? "Charms 7" : "Solutions 1";
      await user.click(screen.getByRole("link", { name: otherType }));

      expect(
        screen.getByRole("checkbox", { name: "Kubernetes (K8s)" })
      ).toBeChecked();
      await screen.findByText(
        type === "solutions" ? "kubernetes charm" : "Kubernetes solution"
      );
      expect(
        screen.getByRole("link", { name: "Solutions 1" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Charms 7" })
      ).toBeInTheDocument();
    }
  );

  test("both or neither selected shows all platforms", async () => {
    const user = renderPackages("/?type=solutions&platforms=vm");
    await screen.findByRole("link", { name: "Solutions 1" });
    await screen.findByRole("link", { name: "Charms 11" });
    expect(
      screen.getByRole("checkbox", { name: "Machine (VM)" })
    ).toBeChecked();

    await user.click(
      screen.getByRole("checkbox", { name: "Kubernetes (K8s)" })
    );
    await screen.findByRole("link", { name: "Solutions 3" });
    await screen.findByRole("link", { name: "Charms 18" });
    expect(screen.getByTestId("location")).toHaveTextContent(
      "platforms=vm%2Ckubernetes"
    );

    await user.click(screen.getByRole("checkbox", { name: "Machine (VM)" }));
    await screen.findByRole("link", { name: "Charms 7" });
    await user.click(
      screen.getByRole("checkbox", { name: "Kubernetes (K8s)" })
    );
    await screen.findByRole("link", { name: "Solutions 3" });
    await screen.findByRole("link", { name: "Charms 18" });
    expect(screen.getByTestId("location")).not.toHaveTextContent("platforms=");
    await waitFor(() =>
      expect(screen.getByText("Other solution")).toBeInTheDocument()
    );
  });
});
