import React, { useState, useEffect, SyntheticEvent } from "react";
import {
  Accordion,
  Strip,
  Button,
  Modal,
  Notification,
  Form,
  Input,
  Icon,
} from "@canonical/react-components";

import { useQuery } from "../utils";

import CollaboratorsTable from "./CollaboratorsTable";
import InvitesTable from "./InvitesTable";

declare global {
  interface Window {
    PACKAGE_NAME: string;
    CSRF_TOKEN: string;
  }
}

function Collaborators() {
  const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [collaboratorToRevoke, setCollaboratorToRevoke] = useState("");
  const [showRevokeSuccess, setShowRevokeSuccess] = useState(false);
  const [showRevokeError, setShowRevokeError] = useState(false);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [showInviteError, setShowInviteError] = useState(false);
  const [showAcceptInvite, setShowAcceptInvite] = useState(false);
  const [collaborators, setCollaborators] = useState([
    {
      email: "jane.doe@canonical.com",
      display_name: "Jane Doe",
      created_by: "",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "asdfasdfasdf",
    },
    {
      email: "john.smith@canonical.com",
      display_name: "John Smith",
      created_by: "",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "prFvYmvaBsQbXLNaVaQFV4EAcJ8zh0Ej",
    },
  ]);
  const [invites, setInvites] = useState([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const packageName = window?.PACKAGE_NAME;

  const closeRevokeConfirmation = () => {
    setShowRevokeConfirmation(false);
  };

  const closeResendConfirmation = () => {
    setShowResendConfirmation(false);
  };

  const revokeInvite = (email: string) => {
    const formData = new FormData();

    formData.set("csrf_token", window?.CSRF_TOKEN);
    formData.set("collaborator", email);

    fetch(`/${packageName}/invites/revoke`, {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (response.status === 200) {
        setCollaborators(
          collaborators.filter((collaborator) => collaborator?.email !== email)
        );
        setShowRevokeSuccess(true);
      } else {
        setShowRevokeError(true);
      }
    });
  };

  let query: { get: Function } = useQuery();

  useEffect(() => {
    fetch(`/${packageName}/invites`)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((data) => {
        setInvites(data?.invites);
      });
  }, [collaborators]);

  const inviteCollaborator = (email?: string) => {
    const formData = new FormData();

    formData.set("collaborators", email || newCollaboratorEmail);
    formData.set("csrf_token", window.CSRF_TOKEN);

    fetch(`/${packageName}/invite`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((data) => {
        setTimeout(() => {
          setInvites(data?.invites?.invites);
          setIsSaving(false);
          setInviteLink(
            `https://charmhub.io/${packageName}/collaboration/confirm?token=${data?.result?.tokens?.[0]?.token}`
          );
        }, 1500);
      });
  };

  useEffect(() => {
    setShowAcceptInvite(query.get("accepted"));
  }, []);

  return (
    <div className="l-application">
      <div className="l-main">
        <Strip>
          {showInviteSuccess && (
            <Notification
              severity="positive"
              onDismiss={() => {
                setShowInviteSuccess(false);
              }}
            >
              The invite has been sent.
            </Notification>
          )}

          {showInviteError && (
            <Notification
              severity="positive"
              onDismiss={() => {
                setShowInviteError(false);
              }}
            >
              There was a problem sending this invite.
            </Notification>
          )}

          {showRevokeSuccess && (
            <Notification
              severity="positive"
              onDismiss={() => {
                setShowRevokeSuccess(false);
              }}
            >
              The invite for <strong>{collaboratorToRevoke}</strong> has been
              revoked.
            </Notification>
          )}

          {showRevokeError && (
            <Notification
              severity="negative"
              onDismiss={() => {
                setShowRevokeError(false);
              }}
            >
              There was a problem revoking the invite for{" "}
              <strong>{collaboratorToRevoke}</strong>.
            </Notification>
          )}

          {showAcceptInvite && (
            <Notification
              severity="positive"
              onDismiss={() => {
                setShowAcceptInvite(false);
              }}
            >
              You are now a collaborator for this package
            </Notification>
          )}

          <Button
            appearance="positive"
            hasIcon
            onClick={() => {
              setShowAddCollaborator(true);
            }}
          >
            <i className="p-icon--plus is-light"></i>
            <span>Add new collaborator</span>
          </Button>

          <Accordion
            expanded="collaborators-table"
            sections={[
              {
                key: "collaborators-table",
                title: `Active shares (${collaborators.length})`,
                content: (
                  <CollaboratorsTable
                    collaborators={collaborators}
                    setCollaboratorToRevoke={setCollaboratorToRevoke}
                    setShowRevokeConfirmation={setShowRevokeConfirmation}
                  />
                ),
              },
              {
                title: `Invites (${invites.length})`,
                content: (
                  <InvitesTable
                    invites={invites}
                    collaborators={collaborators}
                    setCollaboratorToRevoke={setCollaboratorToRevoke}
                    setShowRevokeConfirmation={setShowRevokeConfirmation}
                    setShowResendConfirmation={setShowResendConfirmation}
                    setNewCollaboratorEmail={setNewCollaboratorEmail}
                  />
                ),
              },
            ]}
          />
        </Strip>
      </div>

      <div
        className={`l-aside__overlay ${!showAddCollaborator && "u-hide"}`}
        onClick={() => {
          setShowAddCollaborator(false);
        }}
      ></div>
      <aside className={`l-aside ${!showAddCollaborator && "is-collapsed"}`}>
        <div className="panel">
          <div className="panel__header">
            <h2 className="p-heading--4">Add new collaborator</h2>
            <Button
              appearance="base"
              hasIcon
              onClick={() => {
                setShowAddCollaborator(false);
              }}
            >
              <i className="p-icon--close">Close</i>
            </Button>
          </div>
          <div className="panel__content">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                inviteCollaborator();
              }}
            >
              <Notification severity="caution" title="Role">
                A collaborator is a store user that can have equal rights over a
                particular package as the package publisher.
              </Notification>
              {inviteLink && (
                <>
                  <p>
                    Send this link to the user so that they can accept or reject
                    the invite:
                  </p>
                  <Input type="text" value={inviteLink} readOnly />
                </>
              )}
              <Input
                type="email"
                id="collaborator-email"
                label="Email"
                placeholder="yourname@example.com"
                help="The primary email for the Ubuntu One account"
                value={newCollaboratorEmail}
                onInput={(
                  e: SyntheticEvent<HTMLInputElement> & {
                    target: HTMLInputElement;
                  }
                ) => {
                  setNewCollaboratorEmail(e.target.value);
                }}
              />
            </Form>
          </div>
          <div className="panel__footer">
            <Button
              className={`${isSaving ? "is-processing has-icon" : ""}`}
              disabled={isSaving}
              type="submit"
              appearance="positive"
              onClick={() => {
                inviteCollaborator();
                setIsSaving(true);
              }}
            >
              {isSaving && (
                <Icon name="spinner" className="is-light u-animation--spin" />
              )}
              <span>Add collaborator</span>
            </Button>
          </div>
        </div>
      </aside>

      {showRevokeConfirmation && (
        <Modal
          close={closeRevokeConfirmation}
          title="Revoke invite"
          buttonRow={
            <>
              <Button
                type="button"
                className="u-no-margin--bottom"
                onClick={closeRevokeConfirmation}
              >
                Cancel
              </Button>
              <Button
                appearance="positive"
                className="u-no-margin--bottom"
                onClick={() => {
                  revokeInvite(collaboratorToRevoke);
                  setShowRevokeConfirmation(false);
                }}
              >
                Revoke invite
              </Button>
            </>
          }
        >
          <p>
            Are you sure you want to revoke the invite for{" "}
            <strong>{collaboratorToRevoke}</strong>?
          </p>
        </Modal>
      )}

      {showResendConfirmation && (
        <Modal
          close={closeResendConfirmation}
          title="Send invite"
          buttonRow={
            <>
              <Button
                type="button"
                className="u-no-margin--bottom"
                onClick={closeResendConfirmation}
              >
                Cancel
              </Button>
              <Button
                appearance="positive"
                className="u-no-margin--bottom"
                onClick={() => {
                  inviteCollaborator();
                  setShowResendConfirmation(false);
                }}
              >
                Resend invite
              </Button>
            </>
          }
        >
          <p>Are you sure you want to this invite?</p>
        </Modal>
      )}
    </div>
  );
}

export default Collaborators;
