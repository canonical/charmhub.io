import { SyntheticEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  Notification,
  Input,
  Button,
  Icon,
  Spinner,
  Panel,
} from "@canonical/react-components";

import { isPending } from "../../utils";
import {
  activeInviteEmailState,
  invitesListState,
  inviteLinkState,
} from "../../state/atoms";

import { generateInviteToken } from "../../utils/generateInviteToken";
import { Invite } from "../../types";

type Props = {
  setShowSidePanel: (showSidePanel: boolean) => void;
  setShowInviteSuccess: (showInviteSuccess: boolean) => void;
  setShowInviteError: (showInviteError: boolean) => void;
};

function InviteCollaborator({ setShowSidePanel }: Props): JSX.Element {
  const { packageName } = useParams();
  const queryClient = useQueryClient();
  const [activeInviteEmail, setActiveInviteEmail] = useRecoilState(
    activeInviteEmailState
  );
  const setInviteLink = useSetRecoilState(inviteLinkState);
  const invitesList = useRecoilValue(invitesListState);
  const inviteLink = useRecoilValue(inviteLinkState);

  const [copied, setCopied] = useState(false);
  const [loadingInviteLink, setLoadingInviteLink] = useState(false);

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
    <Panel
      wrapContent={false}
      header={
        <div className="p-panel__header u-no-padding--left u-no-padding--right">
          <h4 className="p-panel__title">Add new collaborator</h4>
          <div className="p-panel__controls">
            <Button
              hasIcon
              type="button"
              className="p-button--base u-no-margin--bottom"
              onClick={() => {
                setShowSidePanel(false);
                queryClient.invalidateQueries("invitesData");
              }}
            >
              <Icon name="close" />
            </Button>
          </div>
        </div>
      }
    >
      <div>
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
          label={<strong>1. Email</strong>}
          placeholder="yourname@example.com"
          help="Collaborator email linked to the Ubuntu One account"
          value={activeInviteEmail}
          onInput={(
            e: SyntheticEvent<HTMLInputElement> & {
              target: HTMLInputElement;
            }
          ) => {
            setActiveInviteEmail(e.target.value);
            setInviteLink("");
          }}
          error={
            !isUnique(activeInviteEmail)
              ? "There is already a pending invite for this email address"
              : ""
          }
        />
        <div className="p-panel__content u-no-padding--top u-no-padding--bottom">
          <h5>2. Invite Link</h5>
          <Button
            type="button"
            appearance="positive"
            disabled={
              !activeInviteEmail ||
              !isUnique(activeInviteEmail) ||
              loadingInviteLink
            }
            onClick={async () => {
              if (activeInviteEmail && isUnique(activeInviteEmail)) {
                try {
                  setLoadingInviteLink(true);
                  const { inviteLink } = await generateInviteToken(
                    activeInviteEmail,
                    packageName!,
                    window.CSRF_TOKEN
                  );
                  setInviteLink(inviteLink);
                } catch (err) {
                  console.error("Error generating invite preview:", err);
                } finally {
                  setLoadingInviteLink(false);
                }
              }
            }}
          >
            {loadingInviteLink ? (
              <>
                <Spinner text="Loading..." />
              </>
            ) : (
              "Send invite"
            )}
          </Button>
          <p className="u-text--muted">
            An email will be sent to the collaborator, it will expire after 30
            days.
          </p>
          <p className="u-text--muted">
            Alternatively, you can share the link below:
          </p>
          {inviteLink ? (
            <div className="grid-row">
              <div className="grid-col-6">
                <pre className="p-code-snippet__block">
                  <code>{inviteLink}</code>
                </pre>
              </div>
              <div className="grid-col-2">
                <Button
                  type="button"
                  appearance="base"
                  className="p-button"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          ) : (
            <pre className="p-code-snippet__block">
              <code>Enter email to generate a unique invitation link</code>
            </pre>
          )}
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
            queryClient.invalidateQueries("invitesData");
          }}
        >
          Done
        </Button>
      </div>
    </Panel>
  );
}

export default InviteCollaborator;
