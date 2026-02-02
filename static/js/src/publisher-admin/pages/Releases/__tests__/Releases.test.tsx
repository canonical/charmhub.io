import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Releases from "../Releases";
import { MutableSnapshot, RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
import "@testing-library/jest-dom";
import { mockPackage } from "../../../mocks";
import { packageDataState } from "../../../state/atoms";
import { Package } from "../../../types";
import useReleases, { ReleaseMap } from "../../../hooks/useReleases";
import { mockReleaseChannel } from "../../../mocks/mockReleaseChannel";
import { usePackage } from "../../../hooks";
import { Mock } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({
    packageName: "test-charm-name",
  }),
}));

vi.mock("../../../hooks/useReleases");
const mockUseReleases = useReleases as Mock;

vi.mock("../../../hooks/usePackage");
const mockUsePackage = usePackage as Mock;

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
      expect(
        screen.getByText("No releases have been added for this charm")
      ).toBeInTheDocument();
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
});
