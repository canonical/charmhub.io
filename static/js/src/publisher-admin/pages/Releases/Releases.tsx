import { useParams } from "react-router-dom";
import useReleases from "../../hooks/useReleasesQuery";

export default function Releases() {
	const { packageName } = useParams();
	const { data: releaseData } = useReleases(packageName);

	return (
		<div>
			<h2 className="p-heading--4">Releases available to install</h2>
			<p>Here are the releases (trust)</p>
		</div>
	);
}
