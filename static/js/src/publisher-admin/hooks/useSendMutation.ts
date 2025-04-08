import { QueryClient, useMutation } from "react-query";
import { generateInviteToken } from "./generateInviteToken";

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

      try {
        const token = await generateInviteToken(
          activeInviteEmail,
          packageName!,
          csrfToken
        );

        const inviteLink = `https://charmhub.io/accept-invite?package=${packageName}&token=${token}`;
        setInviteLink(inviteLink);
        setInviteEmailLink(
          `mailto:${activeInviteEmail}?subject=${publisherName} has invited you to collaborate on ${packageName}&body=Click this link to accept the invite: ${encodeURIComponent(inviteLink)}`
        );

        if (setShowSidePanel) {
          setShowSidePanel(false);
        }

        setShowInviteSuccess(true);
      } catch (err) {
        setShowInviteError(true);
        throw err;
      }

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
