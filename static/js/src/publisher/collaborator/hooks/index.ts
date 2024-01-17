import { useQuery, useMutation } from "react-query";
import { sub, add } from "date-fns";

import type { Invite } from "../types";

export function useInvitesQuery(packageName: string | undefined) {
  return useQuery("invitesData", async () => {
    const response = await fetch(`/${packageName}/invites`, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("There was a problem fetching invites");
    }

    const invitesData = await response.json();

    return invitesData.invites;
  });
}

export function useSendInviteMutation(
  packageName: string | undefined,
  newCollaboratorEmail: string,
  csrfToken: string,
  queryClient: any,
  setInviteLink: Function
) {
  return useMutation(
    async () => {
      const formData = new FormData();

      formData.set("collaborators", newCollaboratorEmail);
      formData.set("csrf_token", csrfToken);

      const response = await fetch(`/${packageName}/invite`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("There was a problem sending invites");
      }

      const inviteData = await response.json();
      // This shouldn't be necessary once emails are enabled
      setInviteLink(
        `/${packageName}/collaboration/confirm?token=${inviteData?.result?.tokens?.[0]?.token}`
      );
    },
    {
      onMutate: async (inviteEmail: string) => {
        await queryClient.cancelQueries("invitesData");

        const previousInvites = queryClient.getQueryData("invitesData");
        const newInvite = {
          accepted_at: null,
          accepted_by: null,
          created_at: new Date().toISOString(),
          created_by: "",
          email: inviteEmail,
          expires_at: sub(add(new Date(), { months: 1 }), {
            days: 1,
          }).toISOString(),
          invite_type: "",
          revoked_at: null,
          revoked_by: null,
        };

        queryClient.setQueryData("invitesData", (oldInvites: any) => {
          return [newInvite, ...oldInvites];
        });

        return { previousInvites };
      },
      onError: ({ context }) => {
        queryClient.setQueryData("invitesData", context?.previousInvites);
      },
      onSettled: () => {
        queryClient.invalidateQueries();
      },
    }
  );
}

export function useRevokeInviteMutation(
  packageName: string | undefined,
  csrfToken: string,
  queryClient: any,
  inviteToRevoke: string,
  setShowRevokeSuccess: Function,
  setShowRevokeError: Function
) {
  return useMutation(
    async () => {
      const formData = new FormData();

      formData.set("csrf_token", csrfToken);
      formData.set("collaborator", inviteToRevoke);

      const response = await fetch(`/${packageName}/invites/revoke`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("There was a problem revoking this invite");
      }

      const responseData = await response.json();

      if (responseData.success) {
        setShowRevokeSuccess(true);
      } else {
        setShowRevokeError(true);
      }
    },
    {
      onMutate: async (inviteEmail: string) => {
        await queryClient.cancelQueries("invitesData");

        const previousInvites: any = queryClient.getQueryData("invitesData");

        queryClient.setQueryData("invitesData", (oldInvites: any) => {
          const revokedInvite = oldInvites.find(
            (invite: Invite) => invite.email === inviteEmail
          );

          revokedInvite.revoked_at = sub(new Date(), {
            minutes: 1,
          }).toISOString();

          return [
            ...oldInvites.filter(
              (invite: Invite) => invite.email !== inviteEmail
            ),
            revokedInvite,
          ];
        });

        return { previousInvites };
      },
      onError: ({ context }) => {
        queryClient.setQueryData("invitesData", context?.previousInvites);
      },
      onSettled: () => {
        queryClient.invalidateQueries();
      },
    }
  );
}
