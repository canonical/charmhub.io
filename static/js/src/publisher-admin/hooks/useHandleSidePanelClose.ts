import { useQueryClient } from "react-query";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useRevokeMutation } from "../hooks";
import {
  activeInviteEmailState,
  invitesListState,
  inviteLinkState,
} from "../state/atoms";
import { useParams } from "react-router-dom";

export function useHandleSidePanelClose(
  setShowSidePanel: (show: boolean) => void
) {
  const { packageName } = useParams();
  const queryClient = useQueryClient();
  const [activeInviteEmail, setActiveInviteEmail] = useRecoilState(
    activeInviteEmailState
  );
  const setInviteLink = useSetRecoilState(inviteLinkState);
  const setInvitesList = useSetRecoilState(invitesListState);

  const revokeMutation = useRevokeMutation(
    packageName,
    activeInviteEmail,
    "invitesData",
    () => {},
    () => {},
    queryClient,
    window.CSRF_TOKEN
  );

  const handleClose = async () => {
    if (activeInviteEmail) {
      try {
        await revokeMutation.mutateAsync();
        setInvitesList((prevInvites) =>
          prevInvites.filter((invite) => invite.email !== activeInviteEmail)
        );
      } catch (error) {
        console.error("Failed to revoke invite", error);
      }
    }

    setInviteLink("");
    setActiveInviteEmail("");
    setShowSidePanel(false);
  };

  return { handleClose };
}
