import { render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import InterfaceDetails from "../InterfaceDetails";
import { InterfaceData } from "../../../types";
import "@testing-library/jest-dom";
import { Mock } from "vitest";

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
}));

vi.mock("react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../../InterfaceDetailsNav", () => ({
  default: () => <div>InterfaceDetailsNav</div>,
}));
vi.mock("../../InterfaceDiscussion", () => ({
  default: () => <div>InterfaceDiscussion</div>,
}));
vi.mock("../../CanonicalRelationsMeta", () => ({
  default: () => <div>CanonicalRelationsMeta</div>,
}));
vi.mock("../../CommunityRelationsMeta", () => ({
  default: () => <div>CommunityRelationsMeta</div>,
}));
vi.mock("../../InterfaceDetailsLinks", () => ({
  default: () => <div>InterfaceDetailsLinks</div>,
}));
vi.mock("../../DeveloperDocumentation", () => ({
  default: () => <div>DeveloperDocumentation</div>,
}));
vi.mock("../../ProvidingCharms", () => ({
  default: () => <div>ProvidingCharms</div>,
}));
vi.mock("../../RequiringCharms", () => ({
  default: () => <div>RequiringCharms</div>,
}));

describe("InterfaceDetails", () => {
  beforeEach(() => {
    (useParams as Mock).mockReturnValue({
      interfaceName: "test-interface",
      interfaceStatus: undefined,
    });
  });

  test("renders loading state when data is being fetched", () => {
    (useQuery as Mock).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    render(<InterfaceDetails interfaceItem={null} />);

    expect(screen.getByText("Fetching interface...")).toBeInTheDocument();
  });

  test("renders error state when there is an error fetching data", () => {
    (useQuery as Mock).mockReturnValue({
      data: undefined,
      error: new Error("Failed to fetch"),
      isLoading: false,
    });

    render(<InterfaceDetails interfaceItem={null} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(
      screen.getByText(
        "There was a problem fetching this interface. Failed to fetch"
      )
    ).toBeInTheDocument();
  });

  test("renders interface details when data is successfully fetched", () => {
    const mockInterfaceData: InterfaceData = {
      name: "test-interface",
      version: "v1.0",
      body: [
        {
          heading: "Main Section",
          level: 1,
          children: [
            {
              heading: "Sub Section",
              level: 2,
              children: [
                {
                  heading: "SubSub Section",
                  level: 3,
                  children: ["Detail 1", "Detail 2"],
                },
              ],
            },
            "Some additional details in string format",
          ],
        },
      ],
      last_modified: "2024-08-14T12:00:00Z",
    };

    (useQuery as Mock).mockReturnValue({
      data: mockInterfaceData,
      error: null,
      isLoading: false,
    });

    render(<InterfaceDetails interfaceItem={null} />);

    expect(screen.getByText("test-interface")).toBeInTheDocument();
    expect(screen.getByText("CanonicalRelationsMeta")).toBeInTheDocument();
    expect(screen.getAllByText("InterfaceDetailsNav")[0]).toBeInTheDocument();
    expect(screen.getByText("InterfaceDiscussion")).toBeInTheDocument();
    expect(screen.getByText("Help us improve this page")).toBeInTheDocument();
  });

  test("renders fallback when interfaceItem matches the interface name", () => {
    const mockInterfaceData: InterfaceData = {
      name: "test-interface",
      version: "v1.0",
      body: [
        {
          heading: "Main Section",
          level: 1,
          children: [
            {
              heading: "Sub Section",
              level: 2,
              children: [
                {
                  heading: "SubSub Section",
                  level: 3,
                  children: ["Detail 1", "Detail 2"],
                },
              ],
            },
            "Some additional details in string format",
          ],
        },
      ],
      last_modified: "2024-08-14T12:00:00Z",
    };

    render(<InterfaceDetails interfaceItem={mockInterfaceData} />);

    expect(screen.getByText("test-interface")).toBeInTheDocument();
    expect(screen.getByText("CanonicalRelationsMeta")).toBeInTheDocument();
    expect(screen.getAllByText("InterfaceDetailsNav")[0]).toBeInTheDocument();
    expect(screen.getByText("InterfaceDiscussion")).toBeInTheDocument();
    expect(screen.getByText("Help us improve this page")).toBeInTheDocument();
  });
});
