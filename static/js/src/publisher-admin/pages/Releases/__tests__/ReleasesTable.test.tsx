import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen } from "@testing-library/react";
import ReleasesTable from "../ReleasesTable";
import { mockReleaseChannel } from "../../../mocks/mockReleaseChannel";

describe("ReleasesTable", () => {
  const latestStable = mockReleaseChannel;

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
    const releases = [latestStable, latestBeta];

    render(
      <ReleasesTable
        releaseMap={releases}
        arch="amd64"
        packageName="test-charm-name"
        packageTitle="Test charm name"
      />
    );

    expect(screen.getByText("latest/stable")).toBeInTheDocument();

    // Because the arch selected is amd64 and beta only has arm64, it should not be rendered
    expect(screen.queryByText("latest/beta")).not.toBeInTheDocument();

    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  test("clicking on a channel displays all rows", async () => {
    const releases = [latestStable];

    const user = userEvent.setup();

    render(
      <ReleasesTable
        releaseMap={releases}
        arch="amd64"
        packageName="test-charm-name"
        packageTitle="Test charm name"
      />
    );

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
    const releaseChannel = [{ ...latestStable, releases }];

    const user = userEvent.setup();

    render(
      <ReleasesTable
        releaseMap={releaseChannel}
        arch="amd64"
        packageName="test-charm-name"
        packageTitle="Test charm name"
      />
    );

    await user.click(screen.getByText("latest/stable"));

    expect(screen.getByText("Show more")).toBeInTheDocument();
    await user.click(screen.getByText("Show more"));

    expect(screen.getAllByRole("row")).toHaveLength(7);
  });
  test("renders release channel rows correctly for different architectures", () => {
    const releases = [latestStable, latestBeta];
    render(
      <ReleasesTable
        releaseMap={releases}
        arch="arm64"
        packageName="test-charm-name"
        packageTitle="Test charm name"
      />
    );
    expect(screen.queryByText("latest/stable")).not.toBeInTheDocument();
    expect(screen.getByText("latest/beta")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  test("opens the share modal for a release row", async () => {
    const user = userEvent.setup();

    render(
      <ReleasesTable
        releaseMap={[latestStable]}
        arch="amd64"
        packageName="test-charm-name"
        packageTitle="Test charm name"
      />
    );

    await user.click(screen.getByRole("button", { name: "Share" }));

    expect(
      screen.getByText("Share test-charm-name latest/stable")
    ).toBeInTheDocument();
    expect(screen.getByText("Loading badge...")).toBeInTheDocument();

    fireEvent.load(
      screen.getByAltText(
        "test-charm-name latest/stable revision 1 GitHub badge"
      )
    );

    expect(screen.queryByText("Loading badge...")).not.toBeInTheDocument();
    expect(
      screen.getByAltText(
        "test-charm-name latest/stable revision 1 GitHub badge"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /\[!\[Test charm name latest\/stable revision 1\]\(\s*https:\/\/charmhub\.io\/test-charm-name\/badge\.svg\?channel=latest%2Fstable&revision=1\s*\)\]\(https:\/\/charmhub\.io\/test-charm-name\?channel=latest%2Fstable\)/
      )
    ).toBeInTheDocument();
  });

  test("uses the selected row revision in the share badge URL", async () => {
    const user = userEvent.setup();

    render(
      <ReleasesTable
        releaseMap={[latestBeta]}
        arch="arm64"
        packageName="test-charm-name"
        packageTitle="Test charm name"
      />
    );

    await user.click(screen.getByText("latest/beta"));
    await user.click(screen.getAllByRole("button", { name: "Share" })[1]);

    expect(
      screen.getByText("Share test-charm-name latest/beta")
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("test-charm-name latest/beta revision 4 GitHub badge")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /\[!\[Test charm name latest\/beta revision 4\]\(\s*https:\/\/charmhub\.io\/test-charm-name\/badge\.svg\?channel=latest%2Fbeta&revision=4\s*\)\]\(https:\/\/charmhub\.io\/test-charm-name\?channel=latest%2Fbeta\)/
      )
    ).toBeInTheDocument();
  });
});
