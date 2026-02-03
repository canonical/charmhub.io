import { render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import InterfaceDetails from "../InterfaceDetails";
import { InterfaceData } from "../../../types";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

jest.mock("react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("../../InterfaceDetailsNav", () => () => (
  <div>InterfaceDetailsNav</div>
));
jest.mock("../../InterfaceDiscussion", () => () => (
  <div>InterfaceDiscussion</div>
));
jest.mock("../../CanonicalRelationsMeta", () => () => (
  <div>CanonicalRelationsMeta</div>
));
jest.mock("../../CommunityRelationsMeta", () => () => (
  <div>CommunityRelationsMeta</div>
));
jest.mock("../../InterfaceDetailsLinks", () => () => (
  <div>InterfaceDetailsLinks</div>
));
jest.mock("../../DeveloperDocumentation", () => () => (
  <div>DeveloperDocumentation</div>
));
jest.mock("../../ProvidingCharms", () => () => <div>ProvidingCharms</div>);
jest.mock("../../RequiringCharms", () => () => <div>RequiringCharms</div>);

const mockUseParams = useParams as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

describe("InterfaceDetails", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({
      interfaceName: "test-interface",
      interfaceStatus: undefined,
    });
  });

  test("renders loading state when data is being fetched", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    render(<InterfaceDetails interfaceItem={null} />);

    expect(screen.getByText("Fetching interface...")).toBeInTheDocument();
  });

  test("renders error state when there is an error fetching data", () => {
    mockUseQuery.mockReturnValue({
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

    mockUseQuery.mockReturnValue({
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
