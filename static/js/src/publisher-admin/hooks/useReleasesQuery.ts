
import { useQuery } from "react-query";

function useReleases(packageName: string | undefined) {
  return useQuery(["releaseData", packageName], async () => {
    const response = await fetch(`/api/packages/${packageName}/releases`);

    if (!response.ok) {
      throw new Error("There was a problem fetching releases");
    }

    const releaseData = await response.json();

    if (!releaseData.success) {
      throw new Error(releaseData?.message);
    }

    return releaseData.data;
  });
}

export default useReleases;
