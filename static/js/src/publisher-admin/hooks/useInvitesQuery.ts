import { useQuery } from "react-query";

function useInvitesQuery(packageName: string | undefined) {
  return useQuery(["invitesData", packageName], async () => {
    const response = await fetch(`/api/packages/${packageName}/invites`, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("There was a problem fetching invites");
    }

    const invitesData = await response.json();

    if (!invitesData.success) {
      throw new Error(invitesData.message);
    }

    return invitesData.data;
  });
}

export default useInvitesQuery;
