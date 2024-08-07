import { QueryClient, useMutation } from "react-query";

function useSendMutation(
  packageName: string | undefined,
  publisherName: string | undefined,
  activeInviteEmail: string | undefined,
  setInviteLink: (value: string) => void,
  setInviteEmailLink: (value: string) => void,
  setShowInviteSuccess: (value: boolean) => void,
  setShowInviteError: (value: boolean) => void,
  queryClient: QueryClient,
  csrfToken: string,
  setShowSidePanel?: (value: boolean) => void
) {
  return useMutation(
    async () => {
      if (!activeInviteEmail) {
        return;
      }

      const formData = new FormData();

      formData.set("collaborators", activeInviteEmail);
      formData.set("csrf_token", csrfToken);

      const response = await fetch(`/api/packages/${packageName}/invites`, {
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
      const inviteLink = `https://charmhub.io/accept-invite?package=${packageName}&token=${inviteData.data[0].token}`;
      setInviteLink(inviteLink);
      setInviteEmailLink(
        `mailto:${inviteData.data[0].email}?subject=${publisherName} has invited you to collaborate on ${packageName}&body=Click this link to accept the invite: ${encodeURIComponent(inviteLink)}`
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
export default useSendMutation;
