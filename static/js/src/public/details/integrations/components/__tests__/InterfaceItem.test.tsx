import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
import "@testing-library/jest-dom";
import { InterfaceItem } from "../InterfaceItem";
import { IInterfaceData } from "../../types";
import { ICharm } from "../../../../../shared/types";
import { Mock } from "vitest";

const queryClient = new QueryClient();

const mockData: IInterfaceData = {
  key: "test-key",
  interface: "test_interface",
  description: "This is a test description.",
  required: true,
};

const mockCharmName: string = "test-charm";

// Mock charm data
const mockCharms: ICharm[] = [
  {
    package: {
      description: "This is a test description.",
      display_name: "Charm 1",
      name: "test-charm-1",
      platforms: ["vm"],
      channel: {
        name: "test-channel-1",
        risk: "stable",
        track: "latest",
      },
    },
    publisher: {
      display_name: "Publisher 1",
      name: "test-publisher-1",
      validation: "test-validation-1",
    },
  },
  {
    package: {
      description: "This is a test description.",
      display_name: "Charm 2",
      name: "test-charm-2",
      platforms: ["k8s"],
      channel: {
        name: "test-channel-2",
        risk: "stable",
        track: "latest",
      },
    },
    publisher: {
      display_name: "Publisher 2",
      name: "test-publisher-2",
      validation: "test-validation-2",
    },
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mock("recoil", async (importOriginal) => ({
    ...(await importOriginal()),
    useRecoilValue: vi.fn(() => []),
    useSetRecoilState: vi.fn(() => vi.fn()),
  }));
});

describe("InterfaceItem Component", () => {
  test("renders with the 'Required' chip when required is set to true", async () => {
    await act(async () => {
      render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <InterfaceItem
              interfaceType="provides"
              interfaceData={mockData}
              charmName={mockCharmName}
            />
          </QueryClientProvider>
        </RecoilRoot>
      );
    });

    expect(
      screen.getByRole("heading", { name: /test-key/ })
    ).toBeInTheDocument();
    expect(screen.getByText("This is a test description.")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  test("renders without the 'Required' chip when required is set to false", async () => {
    const dataWithoutRequired = { ...mockData, required: false };

    await act(async () => {
      render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <InterfaceItem
              interfaceType="provides"
              interfaceData={dataWithoutRequired}
              charmName={mockCharmName}
            />
          </QueryClientProvider>
        </RecoilRoot>
      );
    });

    expect(screen.getByText("test-key")).toBeInTheDocument();
    expect(screen.getByText("This is a test description.")).toBeInTheDocument();
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });

  test("shows loading spinner while data is being fetched", async () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as Mock;

    await act(async () => {
      render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <InterfaceItem
              interfaceType="provides"
              interfaceData={mockData}
              charmName={mockCharmName}
            />
          </QueryClientProvider>
        </RecoilRoot>
      );
    });

    expect(
      screen.getByText(`Loading charms for ${mockData.interface}`)
    ).toBeInTheDocument();
  });

  test("renders 'No charms found' message when no charms are returned and no filters are applied", async () => {
    const dataWithoutInterface = {
      ...mockData,
      interface: "nonexistent_interface",
    };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ packages: [] }),
      })
    ) as Mock;

    await act(async () => {
      render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <InterfaceItem
              interfaceType="provides"
              interfaceData={dataWithoutInterface}
              charmName={mockCharmName}
            />
          </QueryClientProvider>
        </RecoilRoot>
      );
    });

    const noCharmsMessage = screen.getByText(/No charms found/i);
    expect(noCharmsMessage).toBeInTheDocument();
    expect(noCharmsMessage).toHaveTextContent(/nonexistent_interface/i);
  });

  test("renders charms correctly with mock charms data", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ packages: mockCharms }),
      })
    ) as Mock;

    await act(async () => {
      render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <InterfaceItem
              interfaceType="provides"
              interfaceData={mockData}
              charmName={mockCharmName}
            />
          </QueryClientProvider>
        </RecoilRoot>
      );
    });

    await waitFor(() => {
      const charms = screen.queryAllByText(/Charm \d/);
      expect(charms).toHaveLength(2);
      expect(charms.map((el) => el.textContent)).toEqual([
        "Charm 1",
        "Charm 2",
      ]);
    });
  });
});
