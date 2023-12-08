import React, { useState, useEffect, SyntheticEvent } from "react";
import {
  Accordion,
  Strip,
  Button,
  Modal,
  Notification,
  Form,
  Input,
} from "@canonical/react-components";

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
  const [collaboratorToRevoke, setCollaboratorToRevoke] = useState("");
  const [showRevokeSuccess, setShowRevokeSuccess] = useState(false);
  const [showRevokeError, setShowRevokeError] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [invites, setInvites] = useState([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);

  const packageName = window?.PACKAGE_NAME;

  const closeRevokeConfirmation = () => {
    setShowRevokeConfirmation(false);
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
        // setCollaborators();
        // collaborators.filter((collaborator) => collaborator?.email !== email)
        setShowRevokeSuccess(true);
      } else {
        setShowRevokeError(true);
      }
    });
  };

  useEffect(() => {
    fetch(`/${packageName}/invites`)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((data) => {
        // setInvites(data?.invites);
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
        setInviteLink(
          `https://charmhub.io/${packageName}/collaboration/confirm?token=${data?.result?.tokens?.[0]?.token}`
        );
      });
  };

  return (
    <div className="l-application">
      <div className="l-main">
        <Strip shallow>
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

          {/* <Button
            appearance="positive"
            hasIcon
            onClick={() => {
              setShowAddCollaborator(true);
            }}
          >
            <i className="p-icon--plus is-light"></i>
            <span>Add new collaborator</span>
          </Button> */}

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
                    inviteCollaborator={inviteCollaborator}
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
                {inviteLink}
              </Notification>
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
              type="submit"
              appearance="positive"
              onClick={() => {
                inviteCollaborator();
              }}
            >
              Add collaborator
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
    </div>
  );
}

export default Collaborators;
