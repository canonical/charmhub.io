import { useQuery } from "react-query";

function useCollaboratorsQuery(packageName: string | undefined) {
  return useQuery(["collaboratorsData", packageName], async () => {
    const response = await fetch(`/api/packages/${packageName}/collaborators`, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("There was a problem fetching collaborators");
    }

    const collaboratorsData = await response.json();

    if (!collaboratorsData.success) {
      throw new Error(collaboratorsData.message);
    }

    return collaboratorsData.data;
  });
}

export default useCollaboratorsQuery;
