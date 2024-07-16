import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import {
  generateReleaseChannelRows,
  ResourcesCell,
  BasesCell,
} from "../generateReleaseChannelRows";
import { MainTable } from "@canonical/react-components";

describe("generateReleaseChannelRows", () => {
  const releaseChannel: ReleaseChannel = {
    track: "latest",
    risk: "stable",
    releases: [
      {
        revision: {
          version: "1.0",
          bases: [
            { name: "ubuntu", channel: "18.04", architecture: "amd64" },
            { name: "centos", channel: "7", architecture: "x86_64" },
          ],
          "created-at": "2022-01-01",
          "sha3-384": "123456",
          errors: null,
          revision: 1,
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
          bases: [
            { name: "ubuntu", channel: "20.04", architecture: "amd64" },
            { name: "centos", channel: "8", architecture: "x86_64" },
          ],
          "created-at": "2022-01-01",
          "sha3-384": "123456",
          errors: null,
          revision: 1,
          size: 12345,
          status: "published",
        },
        resources: [],
      },
    ],
  };

  test("renders release channel rows correctly", () => {
    const rows = generateReleaseChannelRows(
      releaseChannel,
      "amd64",
      null,
      () => {},
      false,
      () => {}
    );

    render(<MainTable rows={rows} />);

    expect(screen.getByText("latest/stable")).toBeInTheDocument();
    expect(screen.getByText("01 Jan 2022")).toBeInTheDocument();
    expect(screen.getByText("resource2 | File")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  test("renders all releases when channel is selected", () => {
    const rows = generateReleaseChannelRows(
      releaseChannel,
      "amd64",
      "latest/stable",
      () => {},
      false,
      () => {}
    );
    render(<MainTable rows={rows} />);
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  test("renders only one release when channel is not selected", () => {
    const rows = generateReleaseChannelRows(
      releaseChannel,
      "amd64",
      null,
      () => {},
      false,
      () => {}
    );
    render(<MainTable rows={rows} />);
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  test("renders show more button when releases are more than SHOW_MORE_THRESHOLD", () => {
    const releases = [
      ...releaseChannel.releases,
      ...releaseChannel.releases,
      ...releaseChannel.releases,
    ];
    const rows = generateReleaseChannelRows(
      { ...releaseChannel, releases },
      "amd64",
      "latest/stable",
      () => {},
      false,
      () => {}
    );
    render(<MainTable rows={rows} />);
    expect(screen.getByText("Show more")).toBeInTheDocument();
  });

  test("renders all releases when showAll is true", () => {
    const releases = [
      ...releaseChannel.releases,
      ...releaseChannel.releases,
      ...releaseChannel.releases,
    ];
    const rows = generateReleaseChannelRows(
      { ...releaseChannel, releases },
      "amd64",
      "latest/stable",
      () => {},
      true,
      () => {}
    );
    render(<MainTable rows={rows} />);
    expect(screen.getAllByRole("row")).toHaveLength(6);
  });

  test("renders ResourcesCell correctly", () => {
    const resources: Resource[] = [
      { name: "resource1", type: "oci", revision: 1 },
      { name: "resource2", type: "file", revision: null },
    ];

    render(<ResourcesCell resources={resources} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.getByText("resource1 | OCI Image", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText("resource2 | File")).toBeInTheDocument();
  });

  test("renders BasesCell correctly", () => {
    const bases = [
      { name: "ubuntu", channel: "18.04", architecture: "amd64" },
      { name: "centos", channel: "7", architecture: "x86_64" },
    ];

    render(<BasesCell bases={bases} />);

    expect(screen.getByText("18.04")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByAltText("Ubuntu")).toHaveAttribute(
      "src",
      "https://assets.ubuntu.com/v1/adac6928-ubuntu.svg"
    );
    expect(screen.getByAltText("CentOS")).toHaveAttribute(
      "src",
      "https://assets.ubuntu.com/v1/fd5cc5d8-CentOS.svg"
    );
  });
});
