import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { App, getIntegrations } from "../App";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
import { Mock } from "vitest";

const mockData = {
  grouped_relations: {
    provides: [
      {
        key: "interface-1",
        interface: "http",
        type: "provides",
        required: true,
      },
      {
        key: "interface-3",
        interface: "messaging",
        type: "provides",
        required: false,
      },
    ],
    requires: [
      {
        key: "interface-2",
        interface: "database",
        type: "requires",
        required: false,
      },
    ],
  },
};

beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockData),
    })
  ) as Mock;
});

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </RecoilRoot>
  );
};

describe("App component", () => {
  beforeEach(() => {
    (global.fetch as Mock).mockClear();
  });

  test("should render loading spinner initially", async () => {
    renderWithProviders(<App />);

    await waitFor(() => {
      const spinners = screen.queryAllByText("Loading...");
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  test("should fetch and display integrations", async () => {
    renderWithProviders(<App />);

    await waitFor(async () => {
      const integrations = await screen.findByText("3 integrations");
      expect(integrations).toBeInTheDocument();
    });

    const providesHeading = screen.getByText("PROVIDES");
    const requiresHeading = screen.getByText("REQUIRES");

    const allInterface1 = screen.getAllByText("interface-1");

    const interface1Sidebar = allInterface1[0];
    expect(interface1Sidebar).toBeInTheDocument();

    const interface1Content = allInterface1[1];
    expect(interface1Content).toBeInTheDocument();

    const interface2 = screen.getAllByText("interface-2");
    const interface3 = screen.getAllByText("interface-3");

    expect(providesHeading).toBeInTheDocument();
    expect(requiresHeading).toBeInTheDocument();
    expect(interface2[0]).toBeInTheDocument();
    expect(interface3[0]).toBeInTheDocument();
  });

  test("should show 'Required' chip for required integrations", async () => {
    renderWithProviders(<App />);

    await waitFor(() => {
      const interfaceElements = screen.getAllByText("interface-1");

      interfaceElements.forEach((element) => {
        const parentElement = element.closest(".p-heading--4");
        if (parentElement) {
          expect(parentElement).toHaveTextContent("Required");
        }
      });
    });
  });

  test("should filter integrations based on selected chips", async () => {
    renderWithProviders(<App />);

    const searchInput = screen.getByRole("searchbox") as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: "interface-1" } });

    await waitFor(() => {
      const filteredInterfaces = screen.queryAllByText("interface-1");
      expect(filteredInterfaces).toHaveLength(3);
    });
  });

  test("should highlight the active link in the sidebar", async () => {
    renderWithProviders(<App />);

    const activeLink = await screen.findByRole("link", {
      name: /interface-1/i,
    });
    expect(activeLink).toHaveClass("is-active");
  });
});

describe("getIntegrations function", () => {
  test("should fetch integrations with a valid charm and channel", async () => {
    const integrations = await getIntegrations("charm");
    expect(integrations).toEqual([
      {
        key: "interface-1",
        interface: "http",
        type: "provides",
        required: true,
      },
      {
        key: "interface-3",
        interface: "messaging",
        type: "provides",
        required: false,
      },
      {
        key: "interface-2",
        interface: "database",
        type: "requires",
        required: false,
      },
    ]);
  });

  test("should return an empty array if grouped_relations is not present", async () => {
    (global.fetch as Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );

    const integrations = await getIntegrations("charm");
    expect(integrations).toEqual([]);
  });
});

describe("Empty App component", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ grouped_relations: undefined }),
      })
    );
  });

  test("should display message when no integrations are found", async () => {
    render(
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No Integrations have been added for this charm/i)
      ).toBeInTheDocument();
    });
  });
});
