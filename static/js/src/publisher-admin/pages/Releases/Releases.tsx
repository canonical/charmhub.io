import { useParams } from "react-router-dom";
import ReleasesTable from "./ReleasesTable";
import useReleases from "../../hooks/useReleases";
import { useEffect, useState } from "react";
import { Form, Select, Spinner } from "@canonical/react-components";
import { usePackage } from "../../hooks";

export default function Releases() {
  const { packageName } = useParams();
  const { data: releaseData } = useReleases(packageName);
  const { data: packageData } = usePackage(packageName);

  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedArch, setSelectedArch] = useState<string>("");

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

  // sort by the architecture index in all_architectures
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
  ];

  availableArchitectures.sort(
    (a, b) => all_architectures.indexOf(a) - all_architectures.indexOf(b)
  );

  return (
    <>
      <h2 className="p-heading--4">Releases available to install</h2>
      <Form inline>
        <Select
          label="Track:"
          name="track"
          disabled={tracks.length === 1}
          value={selectedTrack}
          onChange={(e) => {
            setSelectedTrack(e.target.value);
          }}
          options={tracks.map((track) => ({
            label: track,
            value: track,
          }))}
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
      <ReleasesTable releaseMap={channels} arch={selectedArch} />
    </>
  );
}
