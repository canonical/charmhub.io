import { useState } from "react";
import { MainTable } from "@canonical/react-components";
import ShareBadgeModal from "./ShareBadgeModal";
import {
  generateReleaseChannelRows,
  ShareBadgeDetails,
} from "../../utils/generateReleaseChannelRows";

type ReleasesTableProps = {
  releaseMap: ReleaseChannel[];
  arch: string;
  packageName: string;
  packageTitle?: string;
};

export default function ReleasesTable({
  releaseMap,
  arch,
  packageName,
  packageTitle,
}: ReleasesTableProps) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [selectedBadge, setSelectedBadge] = useState<ShareBadgeDetails | null>(
    null
  );

  const rows = releaseMap.flatMap((releaseChannel) =>
    generateReleaseChannelRows(
      releaseChannel,
      arch,
      expandedChannel,
      setExpandedChannel,
      showAll,
      setShowAll,
      setSelectedBadge
    )
  );

  return (
    <>
      <MainTable
        role="table"
        className="u-table-layout--auto"
        headers={[
          { content: "Release Channel" },
          { content: "Revision" },
          { content: "Release Date" },
          { content: "Resources" },
          { content: "Platform" },
          { content: "Share" },
        ]}
        rows={rows}
      />
      {selectedBadge && (
        <ShareBadgeModal
          close={() => setSelectedBadge(null)}
          packageName={packageName}
          packageTitle={packageTitle}
          releaseChannel={selectedBadge.releaseChannel}
          revision={selectedBadge.revision}
        />
      )}
    </>
  );
}
