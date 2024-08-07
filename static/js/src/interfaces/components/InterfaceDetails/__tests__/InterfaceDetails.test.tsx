import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import InterfaceDetails from "../InterfaceDetails";

const queryClient = new QueryClient();

jest.mock("mermaid", () => ({
  initialize: jest.fn(),
}));

beforeEach(() => {
  jest.restoreAllMocks();
});

const mockInterfaceData = {
  name: "Test Interface",
  version: "1.0",
  last_modified: "2024-01-01T00:00:00Z",
  body: [],
};

const renderWithRouter = (ui: React.ReactElement, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe("InterfaceDetails", () => {
  test("renders interface name from props", () => {
    renderWithRouter(<InterfaceDetails interfaceItem={mockInterfaceData} />);

    setTimeout(() => {
      expect(screen.getByText("Test Interface")).toBeInTheDocument();
    }, 0);
  });

  test("renders error state correctly", () => {
    global.fetch = jest.fn(() =>
      Promise.reject({ message: "Failed to fetch" })
    ) as jest.Mock;

    renderWithRouter(<InterfaceDetails interfaceItem={mockInterfaceData} />);

    setTimeout(() => {
      expect(
        screen.getByText(
          "There was a problem fetching this interface. Failed to fetch"
        )
      ).toBeInTheDocument();
    }, 0);
  });

  test("displays community notification when no developer documentation", () => {
    const dataWithoutDoc = { ...mockInterfaceData, body: [] };

    renderWithRouter(<InterfaceDetails interfaceItem={dataWithoutDoc} />);

    setTimeout(() => {
      expect(
        screen.getByText("Discuss this interface on discourse.")
      ).toBeInTheDocument();
    }, 0);
  });

  test("displays developer documentation section when available", () => {
    const dataWithDoc = {
      ...mockInterfaceData,
      body: [{ heading: "Section", level: 1, children: [] }],
    };

    renderWithRouter(<InterfaceDetails interfaceItem={dataWithDoc} />);

    setTimeout(() => {
      expect(screen.getByText("Developer Documentation")).toBeInTheDocument();
    }, 0);
  });

  test("renders charms information", () => {
    const dataWithCharms = {
      ...mockInterfaceData,
      charms: {
        requirers: [{ name: "Requirer Charm", url: "http://example.com" }],
        providers: [{ name: "Provider Charm", url: "http://example.com" }],
      },
    };

    renderWithRouter(<InterfaceDetails interfaceItem={dataWithCharms} />);

    setTimeout(() => {
      expect(screen.getByText("Provider Charm")).toBeInTheDocument();
      expect(screen.getByText("Requirer Charm")).toBeInTheDocument();
    }, 0);
  });

  test('displays "No charms found" notification when no charms are found', () => {
    const dataWithoutCharms = {
      ...mockInterfaceData,
      charms: { requirers: [], providers: [] },
    };

    renderWithRouter(<InterfaceDetails interfaceItem={dataWithoutCharms} />);

    setTimeout(() => {
      expect(
        screen.getByText(
          "No charms found that Provide or Require Test Interface"
        )
      ).toBeInTheDocument();
    }, 0);
  });

  test("displays last updated information", () => {
    renderWithRouter(<InterfaceDetails interfaceItem={mockInterfaceData} />);

    setTimeout(() => {
      expect(
        screen.getByText("Last updated about 6 months ago.")
      ).toBeInTheDocument();
    }, 0);
  });

  test("renders loading state", () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

    renderWithRouter(<InterfaceDetails interfaceItem={mockInterfaceData} />);

    expect(screen.getByText("Fetching interface...")).toBeInTheDocument();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(mockInterfaceData),
      })
    ) as jest.Mock;
  });
});
