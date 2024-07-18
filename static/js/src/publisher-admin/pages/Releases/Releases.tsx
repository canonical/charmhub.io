import { useParams } from "react-router-dom";
import ReleasesTable from "./ReleasesTable";
import useReleases from "../../hooks/useReleases";
import { useEffect, useState } from "react";
import { Form, Select, Spinner } from "@canonical/react-components";

export default function Releases() {
  const { packageName } = useParams();
  const { data } = useReleases(packageName);

  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedArch, setSelectedArch] = useState<string>("");

  useEffect(() => {
    if (data) {
      setSelectedArch(data.all_architectures[0]);
      const tracks = Object.values(data.releases).map((release) => release.track);
      setSelectedTrack(tracks.includes("latest") ? "latest" : tracks[0]);
    }
  }, [data]);

  if (!data) {
    return <Spinner text="Loading..." />;
  }

  if (Object.keys(data.releases).length === 0) {
    return <p className="p-heading--4">No releases available</p>;
  }

  const tracks = [...new Set(Object.values(data.releases).map((release) => release.track))];

  const { releases: releaseData, all_architectures } = data;

  return (
    <div>
      <h2 className="p-heading--4">Releases available to install</h2>
      <Form inline>
        <Select
          label="Track:"
          name="track"
          disabled={tracks.length === 1}
          defaultValue={selectedTrack}
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
          disabled={all_architectures.length === 1}
          defaultValue={selectedArch}
          onChange={(e) => {
            setSelectedArch(e.target.value);
          }}
          options={all_architectures.map((arch) => ({
            label: arch,
            value: arch,
          }))}
        />
      </Form>
      <ReleasesTable releaseMap={releaseData} track={selectedTrack} arch={selectedArch} />
    </div>
  );
}
