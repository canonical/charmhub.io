import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import { Modal, Button } from "@canonical/react-components";

import {
  activeInviteEmailState,
  invitesListState,
  inviteLinkState,
  collaboratorsListState,
  inviteEmailLinkState,
  publisherState,
} from "../../state/atoms";
import {
  filteredInvitesListState,
  filteredCollaboratorsListState,
} from "../../state/selectors";
import { useSendMutation, useRevokeMutation } from "../../hooks";

type Props = {
  action: string;
  setShowModal: (showModal: boolean) => void;
  setShowSuccess: (showSuccess: boolean) => void;
  setShowError: (showError: boolean) => void;
  queryKey?: string;
};

function InviteConfirmationModal({
  action,
  setShowModal,
  setShowSuccess,
  setShowError,
  queryKey,
}: Props) {
  const { packageName } = useParams();
  const queryClient = useQueryClient();
  const setInvitesList = useSetRecoilState(invitesListState);
  const invitesList = useRecoilValue(filteredInvitesListState);
  const setCollaboratorsList = useSetRecoilState(collaboratorsListState);
  const collaboratorsList = useRecoilValue(filteredCollaboratorsListState);
  const publisher = useRecoilValue(publisherState);
  const setInviteLink = useSetRecoilState(inviteLinkState);
  const setInviteEmailLink = useSetRecoilState(inviteEmailLinkState);
  const [activeInviteEmail, setActiveInviteEmail] = useRecoilState(
    activeInviteEmailState
  );

  const sendMutation = useSendMutation(
    packageName,
    publisher?.["display-name"],
    activeInviteEmail,
    setInviteLink,
    setInviteEmailLink,
    setShowSuccess,
    setShowError,
    queryClient,
    window.CSRF_TOKEN
  );

  const revokeMutation = useRevokeMutation(
    packageName,
    activeInviteEmail,
    queryKey || "",
    setShowSuccess,
    setShowError,
    queryClient,
    window.CSRF_TOKEN
  );

  return (
    <Modal
      close={() => {
        setShowModal(false);
        setActiveInviteEmail("");
      }}
      title={`${action} ${queryKey && queryKey === "collaboratorsData" ? "collaborator" : "invite"}`}
      buttonRow={
        <>
          <Button
            className="u-no-margin--bottom"
            onClick={() => {
              setShowModal(false);
              setActiveInviteEmail("");
            }}
          >
            Cancel
          </Button>
          <Button
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => {
              setShowModal(false);

              if (queryKey && queryKey === "collaboratorsData") {
                setCollaboratorsList(
                  collaboratorsList.filter((collaborator) => {
                    return collaborator?.account?.email !== activeInviteEmail;
                  })
                );
              } else {
                setInvitesList(
                  invitesList.filter((invite) => {
                    return invite?.email !== activeInviteEmail;
                  })
                );
              }

              if (action === "Resend" || action === "Reopen") {
                sendMutation.mutate();
              }

              if (action === "Revoke") {
                revokeMutation.mutate();
              }
            }}
          >
            {action} invite
          </Button>
        </>
      }
    >
      <p>
        Are you sure you want to {action.toLowerCase()} the{" "}
        {queryKey && queryKey === "collaboratorsData"
          ? "collaborator"
          : "invite"}{" "}
        for <strong>{activeInviteEmail}</strong>?
      </p>
    </Modal>
  );
}

export default InviteConfirmationModal;
