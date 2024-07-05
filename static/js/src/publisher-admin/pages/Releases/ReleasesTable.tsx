import React, { useState } from "react";
import { ReleaseMap } from "../../hooks/useReleases";
import { List, MainTable } from "@canonical/react-components";
import { generateReleaseChannelRows } from "../../utils/generateReleaseChannelRows";

type ReleasesTableProps = {
  releaseMap: ReleaseMap;
};


export default function ReleasesTable({ releaseMap }: ReleasesTableProps) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  const rows = Object.values(releaseMap).flatMap((releaseChannel) =>
    generateReleaseChannelRows(releaseChannel, expandedChannel, setExpandedChannel)
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
