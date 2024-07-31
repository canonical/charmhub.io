import { useParams } from "react-router-dom";
import ReleasesTable from "./ReleasesTable";
import useReleases from "../../hooks/useReleases";
import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Select,
  Spinner,
  Tooltip,
} from "@canonical/react-components";
import { usePackage } from "../../hooks";
import { TrackInfo } from "./TrackInfo";
import { TrackDropdown } from "./TrackDropdown";

export default function Releases() {
  const { packageName } = useParams();
  const { data: releaseData } = useReleases(packageName);
  const { data: packageData } = usePackage(packageName);

  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedArch, setSelectedArch] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (releaseData && packageData) {
      setSelectedArch(releaseData.all_architectures[0]);

      const tracks = Object.values(releaseData.releases).map(
        (release) => release.track
      );

      setSelectedTrack(
        packageData["default-track"] || tracks.includes("latest")
          ? "latest"
          : tracks[0]
      );
    }
  }, [releaseData, packageData]);

  const channels = Object.values(releaseData?.releases || {}).filter(
    (channel) => channel.track === selectedTrack
  );

  const availableArchitectures = [
    ...new Set(
      channels.flatMap((channel) =>
        channel.releases.flatMap((release) =>
          release.revision.bases.map((base) => base.architecture)
        )
      )
    ),
  ];

  useEffect(() => {
    if (!availableArchitectures.includes(selectedArch)) {
      setSelectedArch(availableArchitectures[0]);
    }
  }, [selectedTrack, availableArchitectures, selectedArch]);

  if (!releaseData) {
    return <Spinner text="Loading..." />;
  }

  if (Object.keys(releaseData.releases).length === 0) {
    return <p className="p-heading--4">No releases available</p>;
  }

  const { releases, all_architectures } = releaseData;

  const tracks = [
    ...new Set(Object.values(releases).map((release) => release.track)),
  ].sort((a, b) => b.localeCompare(a));

  availableArchitectures.sort(
    (a, b) => all_architectures.indexOf(a) - all_architectures.indexOf(b)
  );
  const trackData = packageData?.tracks.find(
    (track) => track.name === selectedTrack
  );

  const versionPattern = trackData?.["version-pattern"] || null;
  const automaticPhasingPercentage =
    trackData?.["automatic-phasing-percentage"] || null;

  const guardRails = packageData?.["track-guardrails"];

  return (
    <>
      <h2 className="p-heading--4">Releases available to install</h2>
      <Form inline>
        <TrackDropdown
          defaultTrack={packageData?.["default-track"]}
          tracks={tracks}
          selectedTrack={selectedTrack}
          setSelectedTrack={setSelectedTrack}
          hasGuardrails={guardRails && guardRails.length > 0}
        />
        <Select
          label="Architecture:"
          name="arch"
          disabled={availableArchitectures.length === 1}
          value={selectedArch}
          onChange={(e) => {
            setSelectedArch(e.target.value);
          }}
          options={availableArchitectures.map((arch) => ({
            label: arch,
            value: arch,
          }))}
        />
      </Form>
      <TrackInfo
        versionPattern={versionPattern}
        automaticPhasingPercentage={automaticPhasingPercentage}
      />
      <ReleasesTable releaseMap={channels} arch={selectedArch} />
    </>
  );
}
