import React, { useState, SyntheticEvent } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useRecoilValue } from "recoil";
import { add, sub } from "date-fns";
import {
  Accordion,
  Strip,
  Button,
  Modal,
  Notification,
  Form,
  Input,
} from "@canonical/react-components";

import InvitesTable from "./InvitesTable";
import { Invite } from "../types";

import { inviteToRevokeState } from "../atoms";

declare global {
  interface Window {
    CSRF_TOKEN: string;
  }
}

function Collaborators() {
  const { packageName } = useParams();
  const queryClient = useQueryClient();
  const inviteToRevoke = useRecoilValue(inviteToRevokeState);
  const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);
  const [showRevokeSuccess, setShowRevokeSuccess] = useState(false);
  const [showRevokeError, setShowRevokeError] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);

  const closeRevokeConfirmation = () => {
    setShowRevokeConfirmation(false);
  };

  const {
    isLoading: invitesIsLoading,
    isError: invitesIsError,
    data: invites,
  } = useQuery("invitesData", async () => {
    const response = await fetch(`/${packageName}/invites`, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("There was a problem fetching invites");
    }

    const invitesData = await response.json();

    return invitesData.invites;
  });

  const sendInviteMutation = useMutation(
    async () => {
      const formData = new FormData();

      formData.set("collaborators", newCollaboratorEmail);
      formData.set("csrf_token", window.CSRF_TOKEN);

      const response = await fetch(`/${packageName}/invite`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("There was a problem sending invites");
      }

      const inviteData = await response.json();

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

  const revokeInviteMutation = useMutation(
    async () => {
      const formData = new FormData();

      formData.set("csrf_token", window?.CSRF_TOKEN);
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

  return (
    <div className="l-application collaboration-ui">
      <div className="l-main">
        <Strip shallow>
          {showRevokeSuccess && (
            <Notification
              severity="positive"
              onDismiss={() => {
                setShowRevokeSuccess(false);
              }}
            >
              The invite for <strong>{inviteToRevoke}</strong> has been revoked.
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
              <strong>{inviteToRevoke}</strong>.
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
                title: `Invites ${
                  invites && invites.length > 0 ? `(${invites.length})` : ""
                }`,
                content: (
                  <>
                    {!invitesIsLoading &&
                      !invitesIsError &&
                      invites &&
                      invites.length > 0 && (
                        <InvitesTable
                          invites={invites}
                          setShowRevokeConfirmation={setShowRevokeConfirmation}
                          inviteCollaborator={() => false}
                        />
                      )}
                  </>
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
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              sendInviteMutation.mutate(newCollaboratorEmail);
            }}
          >
            <div className="panel__content">
              <Notification severity="caution" title="Role">
                A collaborator is a store user that can have equal rights over a
                particular package as the package publisher.
              </Notification>
              {inviteLink && (
                <Notification severity="positive">
                  An invite has been created.{" "}
                  <a href={inviteLink}>Accept invite</a>.
                </Notification>
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
            </div>
            <div className="panel__footer">
              <Button type="submit" appearance="positive">
                Add collaborator
              </Button>
            </div>
          </Form>
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
                  revokeInviteMutation.mutate(inviteToRevoke);
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
            <strong>{inviteToRevoke}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}

export default Collaborators;
