import React, { useState } from "react";
import { ReleaseMap } from "../../hooks/useReleases";
import { MainTable } from "@canonical/react-components";
import { generateReleaseChannelRows } from "../../utils/generateReleaseChannelRows";

type ReleasesTableProps = {
  releaseMap: ReleaseMap;
  arch: string;
};

export default function ReleasesTable({
  releaseMap,
  arch,
}: ReleasesTableProps) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  const rows = Object.values(releaseMap).flatMap((releaseChannel) =>
    generateReleaseChannelRows(
      releaseChannel,
      arch,
      expandedChannel,
      setExpandedChannel
    )
  );

  return (
    <MainTable
      className="u-table-layout--auto"
      headers={[
        { content: "Release Channel" },
        { content: "Revision" },
        { content: "Release Date" },
        { content: "Resources" },
        { content: "Platform" },
      ]}
      rows={rows}
    />
  );
}
