import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Releases from "../Releases";
import { MutableSnapshot, RecoilRoot, waitForAll } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import "@testing-library/jest-dom";
import { mockPackage } from "../../../mocks";
import { packageDataState } from "../../../state/atoms";
import { Package } from "../../../types";
import useReleases, { ReleaseMap } from "../../../hooks/useReleases";
import { mockReleaseChannel } from "../../../mocks/mockReleaseChannel";
import { usePackage } from "../../../hooks";
import userEvent from "@testing-library/user-event";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
}));

jest.mock("../../../hooks/useReleases");
const mockUseReleases = useReleases as jest.Mock;

jest.mock("../../../hooks/usePackage");
const mockUsePackage = usePackage as jest.Mock;

mockUsePackage.mockReturnValue({ data: mockPackage });

const queryClient = new QueryClient();

const renderComponent = (packageData: Package = mockPackage) => {
  return render(
    <RecoilRoot
      initializeState={(snapshot: MutableSnapshot) => {
        return snapshot.set(packageDataState, packageData);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Releases />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

const releases: ReleaseMap = {
  "latest/stable": mockReleaseChannel,
};

describe("Releases", () => {
  test("renders loading state when there is still no releaseData", async () => {
    mockUseReleases.mockReturnValue({ data: undefined });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  test("renders empty state when releases are empty", async () => {
    mockUseReleases.mockReturnValue({
      data: {
        all_architectures: [],
        releases: {},
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("No releases available")).toBeInTheDocument();
    });
  });

  test("renders releases table", async () => {
    mockUseReleases.mockReturnValue({
      data: {
        all_architectures: ["amd64"],
        releases,
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText("Releases available to install")
      ).toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("latest/stable")).toBeInTheDocument();
    });
  });

  test("disables track dropdown when only one track is available", async () => {
    mockUseReleases.mockReturnValue({
      data: {
        all_architectures: ["amd64"],
        releases,
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText("Track:")).toBeDisabled();
    });
  });

  test("disables architecture dropdown when only one architecture is available", async () => {
    mockUseReleases.mockReturnValue({
      data: {
        all_architectures: ["amd64"],
        releases,
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText("Architecture:")).toBeDisabled();
    });
  });

  test("renders correct track when switching between tracks", async () => {
    const user = userEvent.setup();
    mockUseReleases.mockReturnValue({
      data: {
        all_architectures: ["amd64"],
        releases: {
          "latest/stable": { ...mockReleaseChannel, track: "latest" },
          "1/stable": { ...mockReleaseChannel, track: "1" },
        },
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("latest/stable")).toBeInTheDocument();
    });
    // Switch to a different track
    const trackSelect = screen.getByLabelText("Track:");
    user.selectOptions(trackSelect, "1");
    await waitFor(() => {
      expect(screen.getByText("1/stable")).toBeInTheDocument();
      expect(screen.queryByText("latest/stable")).not.toBeInTheDocument();
    });
  });
});