import React, { useState, useEffect, SyntheticEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import {
  Accordion,
  Strip,
  Button,
  Modal,
  Notification,
  Form,
  Input,
  Row,
  Col,
} from "@canonical/react-components";

import CollaboratorsTable from "./CollaboratorsTable";
import InvitesTable from "./InvitesTable";
import CollaboratorsFilter from "./CollaboratorsFilter";

import { isPending } from "../utils";

import {
  useCollaboratorsQuery,
  useInvitesQuery,
  useSendInviteMutation,
  useRevokeInviteMutation,
} from "../hooks";
import {
  activeInviteState,
  actionState,
  inviteLinkState,
  collaboratorsListState,
  collaboratorsListFilterState,
  invitesListState,
} from "../atoms";
import {
  filteredCollaboratorsListState,
  filteredInvitesListState,
} from "../selectors";

import type { Collaborator, Invite } from "../types";

declare global {
  interface Window {
    CSRF_TOKEN: string;
  }
}

function Collaborators() {
  const { packageName } = useParams();
  const queryClient = useQueryClient();
  const [activeInvite, setActiveInvite] = useRecoilState(activeInviteState);
  const [inviteLink, setInviteLink] = useRecoilState(inviteLinkState);
  const action = useRecoilValue(actionState);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [showRevokeSuccess, setShowRevokeSuccess] = useState(false);
  const [showRevokeError, setShowRevokeError] = useState(false);
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [searchParams] = useSearchParams();
  const setCollaboratorsList = useSetRecoilState<Array<Collaborator>>(
    collaboratorsListState
  );
  const setInvitesList = useSetRecoilState<Array<Invite>>(invitesListState);
  const setFilter = useSetRecoilState<string>(collaboratorsListFilterState);
  const invitesList = useRecoilValue<Array<Invite>>(filteredInvitesListState);
  const collaboratorsList = useRecoilValue<Array<Collaborator>>(
    filteredCollaboratorsListState
  );

  const {
    isLoading: collaboratorsIsLoading,
    isError: collaboratorsIsError,
    data: collaboratorsData,
  } = useCollaboratorsQuery(packageName);

  const {
    isLoading: invitesIsLoading,
    isError: invitesIsError,
    data: invites,
  } = useInvitesQuery(packageName);

  const sendInviteMutation = useSendInviteMutation(
    packageName,
    window.CSRF_TOKEN,
    queryClient,
    activeInvite,
    setInviteLink,
    setShowInviteSuccess,
    setShowAddCollaborator
  );

  const revokeInviteMutation = useRevokeInviteMutation(
    packageName,
    window.CSRF_TOKEN,
    queryClient,
    activeInvite,
    setShowRevokeSuccess,
    setShowRevokeError
  );

  const isUnique = (activeInvite: string | undefined) => {
    if (!activeInvite) {
      return true;
    }

    if (!invites) {
      return false;
    }

    const existingInvites = invites.filter((invite: Invite) => {
      return invite.email === activeInvite && isPending(invite);
    });

    if (!existingInvites.length) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (
      !collaboratorsIsLoading &&
      !collaboratorsIsError &&
      !invitesIsLoading &&
      !invitesIsError
    ) {
      setCollaboratorsList(collaboratorsData.collaborators);
      setInvitesList(invites);
      setFilter(searchParams.get("filter") || "");
    }
  }, [
    collaboratorsIsLoading,
    collaboratorsIsError,
    collaboratorsData,
    invitesIsLoading,
    invitesIsError,
    invites,
  ]);

  return (
    <div className="l-application collaboration-ui">
      <div className="l-main">
        <Strip shallow>
          {showInviteSuccess && (
            <Notification
              severity="positive"
              onDismiss={() => {
                setShowInviteSuccess(false);
              }}
            >
              An invite has been created. <a href={inviteLink}>Accept invite</a>
              .
            </Notification>
          )}

          {showRevokeSuccess && (
            <Notification
              severity="positive"
              onDismiss={() => {
                setShowRevokeSuccess(false);
              }}
            >
              The invite for <strong>{activeInvite}</strong> has been revoked.
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
              <strong>{activeInvite}</strong>.
            </Notification>
          )}

          <Row>
            <Col size={6}>
              <CollaboratorsFilter />
            </Col>
            <Col size={6} className="u-align--right">
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
            </Col>
          </Row>

          <Accordion
            expanded="collaborators-table"
            sections={[
              {
                key: "collaborators-table",
                title: `Active shares (${collaboratorsList.length})`,
                content: (
                  <>
                    {!collaboratorsIsLoading &&
                      !collaboratorsIsError &&
                      collaboratorsData &&
                      collaboratorsData.collaborators.length > 0 && (
                        <CollaboratorsTable
                          collaboratorsData={collaboratorsData}
                          setShowConfirmation={setShowConfirmation}
                        />
                      )}
                  </>
                ),
              },
              {
                key: "invites-table",
                title: `Invites (${invitesList.length})`,
                content: (
                  <>
                    {!invitesIsLoading &&
                      !invitesIsError &&
                      invites &&
                      invites.length > 0 && (
                        <InvitesTable
                          invites={invites}
                          setShowConfirmation={setShowConfirmation}
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
        <Form
          style={{ height: "100%" }}
          onSubmit={(e) => {
            e.preventDefault();
            sendInviteMutation.mutate(activeInvite);
            setActiveInvite("");
          }}
        >
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
                value={activeInvite}
                onInput={(
                  e: SyntheticEvent<HTMLInputElement> & {
                    target: HTMLInputElement;
                  }
                ) => {
                  setActiveInvite(e.target.value);
                }}
                error={
                  !isUnique(activeInvite)
                    ? "There is already an invite for this email address"
                    : ""
                }
              />
            </div>
            <div className="panel__footer u-align--right">
              <Button
                type="button"
                className="u-no-margin--bottom"
                onClick={() => {
                  setShowAddCollaborator(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                appearance="positive"
                className="u-no-margin--bottom"
                disabled={!activeInvite || !isUnique(activeInvite)}
              >
                Add collaborator
              </Button>
            </div>
          </div>
        </Form>
      </aside>

      {showConfirmation && (
        <Modal
          close={() => {
            setShowConfirmation(false);
          }}
          title={`${action} invite`}
          buttonRow={
            <>
              <Button
                type="button"
                className="u-no-margin--bottom"
                onClick={() => {
                  setShowConfirmation(false);
                }}
              >
                Cancel
              </Button>
              <Button
                appearance="positive"
                className="u-no-margin--bottom"
                onClick={() => {
                  if (action === "Revoke") {
                    revokeInviteMutation.mutate(activeInvite);
                  }

                  if (action === "Resend" || action === "Reopen") {
                    sendInviteMutation.mutate(activeInvite);
                  }

                  setShowConfirmation(false);
                }}
              >
                {action} invite
              </Button>
            </>
          }
        >
          <p>
            Are you sure you want to {action.toLowerCase()} the invite for{" "}
            <strong>{activeInvite}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}

export default Collaborators;
