import { useQuery, useMutation } from "react-query";

export function useCollaboratorsQuery(packageName: string | undefined) {
  return useQuery("collaboratorsData", async () => {
    const response = await fetch(`/${packageName}/collaborators`, {
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

export function useInvitesQuery(packageName: string | undefined) {
  return useQuery("invitesData", async () => {
    const response = await fetch(`/${packageName}/invites`, {
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

export function useSendMutation(
  packageName: string | undefined,
  activeInviteEmail: string | undefined,
  setInviteLink: Function,
  setShowInviteSuccess: Function,
  setShowInviteError: Function,
  queryClient: any,
  csrfToken: string,
  setShowSidePanel?: Function
) {
  return useMutation(
    async () => {
      if (!activeInviteEmail) {
        return;
      }

      const formData = new FormData();

      formData.set("collaborators", activeInviteEmail);
      formData.set("csrf_token", csrfToken);

      const response = await fetch(`/${packageName}/invite`, {
        method: "POST",
        body: formData,
      });

      if (setShowSidePanel) {
        setShowSidePanel(false);
      }

      if (!response.ok) {
        setShowInviteError(true);
        throw new Error(response.statusText);
      }

      const inviteData = await response.json();

      if (!inviteData.success) {
        setShowInviteError(true);
        throw new Error(inviteData.message);
      }

      // This shouldn't be necessary once emails are enabled
      setInviteLink(
        `/accept-invite?package=${packageName}&token=${inviteData.data[0].token}`
      );

      setShowInviteSuccess(true);
    },
    {
      onError: ({ context }) => {
        queryClient.setQueryData("invitesData", context?.previousInvites);
      },
      onSettled: () => {
        queryClient.invalidateQueries();
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      },
    }
  );
}

export function useRevokeMutation(
  packageName: string | undefined,
  activeInviteEmail: string | undefined,
  queryKey: string,
  setShowRevokeSuccess: Function,
  setShowRevokeError: Function,
  queryClient: any,
  csrfToken: string
) {
  return useMutation(
    async () => {
      if (!activeInviteEmail) {
        return;
      }

      const formData = new FormData();

      formData.set("csrf_token", csrfToken);
      formData.set("collaborator", activeInviteEmail);

      const response = await fetch(`/${packageName}/invites/revoke`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setShowRevokeError(true);
        throw new Error(response.statusText);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        setShowRevokeError(true);
        throw new Error(responseData.message);
      }

      setShowRevokeSuccess(true);
    },
    {
      onError: ({ context }) => {
        queryClient.setQueryData(queryKey, context?.previousInvites);
      },
      onSettled: () => {
        queryClient.invalidateQueries();
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      },
    }
  );
}
