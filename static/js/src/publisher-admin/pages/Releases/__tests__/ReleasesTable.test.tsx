import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import ReleasesTable from "../ReleasesTable";
import { mockReleaseChannel } from "../../../mocks/mockReleaseChannel";

describe("ReleasesTable", () => {

  const latestStable = mockReleaseChannel

  const latestBeta: ReleaseChannel = {
    track: "latest",
    risk: "beta",
    releases: [
      {
        revision: {
          version: "1.0",
          bases: [{ name: "ubuntu", channel: "18.04", architecture: "arm64" }],
          "created-at": "2022-01-01",
          "sha3-384": "123456",
          errors: null,
          revision: 3,
          size: 12345,
          status: "published",
        },
        resources: [
          { name: "resource1", type: "oci", revision: 2 },
          { name: "resource2", type: "file", revision: null },
        ],
      },
      {
        revision: {
          version: "2.0",
          bases: [{ name: "ubuntu", channel: "20.04", architecture: "arm64" }],
          "created-at": "2022-01-01",
          "sha3-384": "123456",
          errors: null,
          revision: 4,
          size: 12345,
          status: "published",
        },
        resources: [],
      },
    ],
  };


  test("renders release channel rows correctly", () => {
    const releaseMap = {
      "latest/stable": latestStable,
      "latest/beta": latestBeta,
    } as const;

    render(<ReleasesTable releaseMap={releaseMap} arch="amd64" />);

    expect(screen.getByText("latest/stable")).toBeInTheDocument();

    // Because the arch selected is amd64 and beta only has arm64, it should not be rendered
    expect(screen.queryByText("latest/beta")).not.toBeInTheDocument();

    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  test("clicking on a channel displays all rows", async () => {
    const releaseMap = {
      "latest/stable": latestStable,
    } as const;

    const user = userEvent.setup();

    render(<ReleasesTable releaseMap={releaseMap} arch="amd64" />);

    await user.click(screen.getByText("latest/stable"));

    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("latest/stable")).toBeInTheDocument();
  });

  test("clicking on show more displays all rows", async () => {
    const releases = [
      ...latestStable.releases,
      ...latestStable.releases,
      ...latestStable.releases,
    ];
    const releaseMap = {
      "latest/stable": { ...latestStable, releases },
    } as const;

    const user = userEvent.setup();

    render(<ReleasesTable releaseMap={releaseMap} arch="amd64" />);

    await user.click(screen.getByText("latest/stable"));

    expect(screen.getByText("Show more")).toBeInTheDocument();
    await user.click(screen.getByText("Show more"));

    expect(screen.getAllByRole("row")).toHaveLength(7);
  });
});
