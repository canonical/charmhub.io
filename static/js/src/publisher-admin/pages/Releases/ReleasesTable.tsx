import React, { useState } from "react";
import { ReleaseMap } from "../../hooks/useReleases";
import { MainTable } from "@canonical/react-components";
import { generateReleaseChannelRows } from "../../utils/generateReleaseChannelRows";

type ReleasesTableProps = {
  releaseMap: ReleaseMap;
  arch: string;
  track: string;
};

export default function ReleasesTable({
  releaseMap,
  arch,
  track
}: ReleasesTableProps) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  const rows = Object.values(releaseMap).filter(releaseChannel => releaseChannel.track === track).flatMap((releaseChannel) =>
    generateReleaseChannelRows(
      releaseChannel,
      arch,
      expandedChannel,
      setExpandedChannel,
      showAll,
      setShowAll
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
