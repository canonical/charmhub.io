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

import { generateInviteToken } from "../../hooks/generateInviteToken";
import { Invite } from "../../types";

type Props = {
  setShowSidePanel: (showSidePanel: boolean) => void;
  setShowInviteSuccess: (showInviteSuccess: boolean) => void;
  setShowInviteError: (showInviteError: boolean) => void;
};

function InviteCollaborator({
  setShowSidePanel,
  setShowInviteSuccess,
  setShowInviteError,
}: Props) {
  const { packageName } = useParams<{ packageName: string }>();
  const queryClient = useQueryClient();
  const [activeInviteEmail, setActiveInviteEmail] = useRecoilState(
    activeInviteEmailState
  );
  const setInviteLink = useSetRecoilState(inviteLinkState);
  const setInviteEmailLink = useSetRecoilState(inviteEmailLinkState);
  const invitesList = useRecoilValue(invitesListState);
  const publisher = useRecoilValue(publisherState);
  const inviteLink = useRecoilValue(inviteLinkState);

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
      onSubmit={(e: { preventDefault: () => void }) => {
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
          <Notification severity="caution" title="A collaborator can:">
            <ul>
              <li>Access and modify this charm</li>
              <li>Publish new versions and manage releases</li>
              <li>Represent the charm alongside you as a publisher</li>
            </ul>
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
            onBlur={async () => {
              if (activeInviteEmail && isUnique(activeInviteEmail)) {
                try {
                  const token = await generateInviteToken(
                    activeInviteEmail,
                    packageName!,
                    window.CSRF_TOKEN
                  );
                  const inviteLink = `https://charmhub.io/accept-invite?package=${packageName}&token=${token}`;
                  setInviteLink(inviteLink);
                } catch (err) {
                  console.error("Error generating invite preview:", err);
                }
              }
            }}
            error={
              !isUnique(activeInviteEmail)
                ? "There is already a pending invite for this email address"
                : ""
            }
          />
          <div>
            <h5>Invite Link</h5>
            {inviteLink ? (
              <code>{inviteLink}</code>
            ) : (
              <code>Enter email to generate a unique invitation link</code>
            )}
            <p className="u-text--muted">
              Important: This link will <strong>NOT</strong> be automatically
              sent.
            </p>
            <div className="u-text--muted">
              After generating, you'll need to:
              <ul>
                <li>Copy the link</li>
                <li>Share it with your collaborator</li>
                <li>The link expires 30 days after generation</li>
              </ul>
            </div>
            <p className="u-text--muted">
              Once your collaborator uses the link, they'll gain access to the
              charm.
            </p>
          </div>
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
