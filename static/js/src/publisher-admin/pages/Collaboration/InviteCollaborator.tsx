import { SyntheticEvent } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  Notification,
  Form,
  Input,
  Button,
  Icon,
} from "@canonical/react-components";

import { isPending } from "../../utils";
import {
  activeInviteEmailState,
  invitesListState,
  inviteLinkState,
  inviteEmailLinkState,
  publisherState,
} from "../../state/atoms";
import { useSendMutation } from "../../hooks";

import { Invite } from "../../types";

type Props = {
  setShowSidePanel: Function;
  setShowInviteSuccess: Function;
  setShowInviteError: Function;
};

function InviteCollaborator({
  setShowSidePanel,
  setShowInviteSuccess,
  setShowInviteError,
}: Props) {
  const { packageName } = useParams();
  const queryClient = useQueryClient();
  const [activeInviteEmail, setActiveInviteEmail] = useRecoilState(
    activeInviteEmailState
  );
  const setInviteLink = useSetRecoilState(inviteLinkState);
  const setInviteEmailLink = useSetRecoilState(inviteEmailLinkState);
  const invitesList = useRecoilValue(invitesListState);
  const publisher = useRecoilValue(publisherState);

  const sendMutation = useSendMutation(
    packageName,
    publisher?.["display-name"],
    activeInviteEmail,
    setInviteLink,
    setInviteEmailLink,
    setShowInviteSuccess,
    setShowInviteError,
    queryClient,
    window.CSRF_TOKEN,
    setShowSidePanel
  );

  const isUnique = (email: string | undefined) => {
    if (!email) {
      return true;
    }

    if (!invitesList) {
      return false;
    }

    const existingInvites = invitesList.filter((invite: Invite) => {
      return invite.email === email && isPending(invite);
    });

    if (!existingInvites.length) {
      return true;
    }

    return false;
  };

  return (
    <Form
      style={{ height: "100%" }}
      onSubmit={(e) => {
        e.preventDefault();
        sendMutation.mutate();
        setActiveInviteEmail("");
      }}
    >
      <div className="p-panel">
        <div className="p-panel__header u-no-padding--left u-no-padding--right">
          <h4 className="p-panel__title">Add new collaborator</h4>
          <div className="p-panel__controls">
            <Button
              hasIcon
              className="p-button--base u-no-margin--bottom"
              onClick={() => {
                setShowSidePanel(false);
              }}
            >
              <Icon name="close" />
            </Button>
          </div>
        </div>
        <div className="p-panel__content">
          <Notification severity="caution" title="Role">
            A collaborator is a store user that can have equal rights over a
            particular package as the package publisher.
          </Notification>
          <Input
            type="email"
            id="collaborator-email"
            label="Email"
            placeholder="yourname@example.com"
            help="The primary email for the Ubuntu One account"
            value={activeInviteEmail}
            onInput={(
              e: SyntheticEvent<HTMLInputElement> & {
                target: HTMLInputElement;
              }
            ) => {
              setActiveInviteEmail(e.target.value);
            }}
            error={
              !isUnique(activeInviteEmail)
                ? "There is already a pending invite for this email address"
                : ""
            }
          />
        </div>
        <div className="p-panel__footer u-align--right">
          <Button
            type="button"
            className="u-no-margin--bottom"
            onClick={() => {
              setShowSidePanel(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            appearance="positive"
            className="u-no-margin--bottom"
            disabled={!activeInviteEmail || !isUnique(activeInviteEmail)}
          >
            Add collaborator
          </Button>
        </div>
      </div>
    </Form>
  );
}

export default InviteCollaborator;
