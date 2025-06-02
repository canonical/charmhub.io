import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import {
  generateReleaseChannelRows,
  ResourcesCell,
  BasesCell,
} from "../generateReleaseChannelRows";
import { MainTable } from "@canonical/react-components";
import { mockReleaseChannel } from "../../mocks/mockReleaseChannel";

describe("generateReleaseChannelRows", () => {
  test("renders release channel rows correctly", () => {
    const rows = generateReleaseChannelRows(
      mockReleaseChannel,
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
      mockReleaseChannel,
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
      mockReleaseChannel,
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
      ...mockReleaseChannel.releases,
      ...mockReleaseChannel.releases,
      ...mockReleaseChannel.releases,
    ];
    const rows = generateReleaseChannelRows(
      { ...mockReleaseChannel, releases },
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
      ...mockReleaseChannel.releases,
      ...mockReleaseChannel.releases,
      ...mockReleaseChannel.releases,
    ];
    const rows = generateReleaseChannelRows(
      { ...mockReleaseChannel, releases },
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
      { name: "resource1", type: "oci-image", revision: 1 },
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
      "https://assets.ubuntu.com/v1/b4ba06f2-Ubuntu%20logo.svg"
    );
    expect(screen.getByAltText("CentOS")).toHaveAttribute(
      "src",
      "https://assets.ubuntu.com/v1/fd5cc5d8-CentOS.svg"
    );
  });
});
