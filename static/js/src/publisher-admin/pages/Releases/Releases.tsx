import { useParams } from "react-router-dom";
import ReleasesTable from "./ReleasesTable";
import useReleases from "../../hooks/useReleases";

export default function Releases() {
	const { packageName } = useParams();
	const { data: releaseData } = useReleases(packageName);

	if (!releaseData) {
		// TODO: Actual loader
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h2 className="p-heading--4">Releases available to install</h2>
			<ReleasesTable releaseMap={releaseData} />
		</div>
	);
}
