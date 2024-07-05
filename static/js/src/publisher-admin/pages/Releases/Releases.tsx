import { useParams } from "react-router-dom";
import ReleasesTable from "./ReleasesTable";
import useReleases from "../../hooks/useReleases";
import { useEffect, useState } from "react";
import { Form, Select, Spinner } from "@canonical/react-components";

export default function Releases() {
  const { packageName } = useParams();
  const { data } = useReleases(packageName);

  const [selectedArch, setSelectedArch] = useState<string>("");

  useEffect(() => {
    if (data) {
      setSelectedArch(data.all_architectures[0]);
    }
  }, [data]);

  if (!data) {
    return <Spinner text="Loading..." />;
  }

  const { releases: releaseData, all_architectures } = data;

  return (
    <div>
      <h2 className="p-heading--4">Releases available to install</h2>
      <Form inline>
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
      <ReleasesTable releaseMap={releaseData} arch={selectedArch} />
    </div>
  );
}
