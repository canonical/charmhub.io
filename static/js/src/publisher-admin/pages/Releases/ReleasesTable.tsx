import { useState } from "react";
import { MainTable } from "@canonical/react-components";
import { generateReleaseChannelRows } from "../../utils/generateReleaseChannelRows";

type ReleasesTableProps = {
  releaseMap: ReleaseChannel[];
  arch: string;
};

export default function ReleasesTable({
  releaseMap,
  arch,
}: ReleasesTableProps) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  const rows = releaseMap.flatMap((releaseChannel) =>
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
      role="table"
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
