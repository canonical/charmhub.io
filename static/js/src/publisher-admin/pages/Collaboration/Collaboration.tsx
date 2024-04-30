import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  Strip,
  Row,
  Col,
  Button,
  Icon,
  Notification,
  Accordion,
} from "@canonical/react-components";

import CollaboratorFilter from "./CollaboratorFilter";
import Collaborators from "./Collaborators";
import Invites from "./Invites";
import InviteCollaborator from "./InviteCollaborator";
import InviteConfirmationModal from "./InviteConfirmationModal";

import { publisherMatchesFilterQuery } from "../../utils";

import {
  collaboratorsListState,
  publisherState,
  invitesListState,
  activeInviteEmailState,
  inviteLinkState,
  inviteEmailLinkState,
  filterQueryState,
} from "../../state/atoms";
import {
  filteredCollaboratorsListState,
  filteredInvitesListState,
} from "../../state/selectors";
import { useCollaboratorsQuery, useInvitesQuery } from "../../hooks";

function Collaboration() {
  const { packageName } = useParams();
  const [showRevokeSuccess, setShowRevokeSuccess] = useState<boolean>(false);
  const [showRevokeError, setShowRevokeError] = useState<boolean>(false);
  const [showInviteSuccess, setShowInviteSuccess] = useState<boolean>(false);
  const [showInviteError, setShowInviteError] = useState<boolean>(false);
  const [showSidePanel, setShowSidePanel] = useState<boolean>(false);
  const [showRevokeCollaboratorModal, setShowRevokeCollaboratorModal] =
    useState<boolean>(false);
  const [showRevokeInviteModal, setShowRevokeInviteModal] =
    useState<boolean>(false);
  const [showReopenInviteModal, setShowReopenInviteModal] =
    useState<boolean>(false);
  const [showResendInviteModal, setShowResendInviteModal] =
    useState<boolean>(false);
  const setCollaboratorsList = useSetRecoilState(collaboratorsListState);
  const collaboratorsList = useRecoilValue(filteredCollaboratorsListState);
  const [publisher, setPublisher] = useRecoilState(publisherState);
  const setInvitesList = useSetRecoilState(invitesListState);
  const invitesList = useRecoilValue(filteredInvitesListState);
  const activeInviteEmail = useRecoilValue(activeInviteEmailState);
  const inviteLink = useRecoilValue(inviteLinkState);
  const inviteEmailLink = useRecoilValue(inviteEmailLinkState);
  const filterQuery = useRecoilValue(filterQueryState);
  const { data: collaboratorsData } = useCollaboratorsQuery(packageName);
  const { data: invitesData } = useInvitesQuery(packageName);

  const getCollaboratorsCount = () => {
    if (publisher) {
      if (!filterQuery || publisherMatchesFilterQuery(publisher, filterQuery)) {
        return collaboratorsList.length + 1;
      }
    }

    return collaboratorsList.length;
  };

  useEffect(() => {
    if (collaboratorsData && collaboratorsData.collaborators) {
      setCollaboratorsList(collaboratorsData.collaborators);
    }

    if (collaboratorsData && collaboratorsData.publisher) {
      setPublisher(collaboratorsData.publisher);
    }
  }, [collaboratorsData]);

  useEffect(() => {
    if (invitesData && invitesData.length) {
      setInvitesList(invitesData);
    }
  }, [invitesData]);

  return (
    <>
      <div className="l-application">
        <div className="l-main">
          <Strip shallow>
            <div className="u-fixed-width">
              {showRevokeSuccess && (
                <Notification
                  severity="positive"
                  onDismiss={() => {
                    setShowRevokeSuccess(false);
                  }}
                >
                  The invite for <strong>{activeInviteEmail}</strong> has been
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
                  <strong>{activeInviteEmail}</strong>.
                </Notification>
              )}

              {showInviteSuccess && (
                <Notification
                  severity="positive"
                  title="An invite has been created"
                  onDismiss={() => {
                    setShowInviteSuccess(false);
                  }}
                >
                  <p>
                    <a target="_blank" href={inviteEmailLink}>
                      Send the invite by email
                    </a>{" "}
                    or copy link:
                  </p>
                  <div>
                    <input
                      className="u-no-margin--bottom"
                      type="text"
                      readOnly
                      value={inviteLink}
                      style={{
                        color: "inherit",
                      }}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                    />
                  </div>
                </Notification>
              )}

              {showInviteError && (
                <Notification
                  severity="negative"
                  onDismiss={() => {
                    setShowInviteError(false);
                  }}
                >
                  There was a problem creating an invite for{" "}
                  <strong>{activeInviteEmail}</strong>.
                </Notification>
              )}
            </div>
            <Row>
              <Col size={6}>
                <CollaboratorFilter />
              </Col>
              <Col size={6} className="u-align--right">
                <Button
                  appearance="positive"
                  hasIcon
                  onClick={() => {
                    setShowSidePanel(true);
                  }}
                >
                  <Icon name="plus" light />
                  <span>Add new collaborator</span>
                </Button>
              </Col>
            </Row>
          </Strip>
          <Strip shallow className="u-no-padding--top">
            <div className="u-fixed-width">
              <Accordion
                expanded="collaborators"
                sections={[
                  {
                    key: "collaborators",
                    title: `Active shares (${getCollaboratorsCount()})`,
                    content: (
                      <Collaborators
                        setShowRevokeModal={setShowRevokeCollaboratorModal}
                      />
                    ),
                  },
                  {
                    key: "invites",
                    title: `Invites (${invitesList.length})`,
                    content: (
                      <Invites
                        setShowRevokeModal={setShowRevokeInviteModal}
                        setShowReopenModal={setShowReopenInviteModal}
                        setShowResendModal={setShowResendInviteModal}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </Strip>
        </div>
        <div
          className={`l-aside__overlay ${!showSidePanel && "u-hide"}`}
          onClick={() => {
            setShowSidePanel(false);
          }}
        ></div>
        <aside className={`l-aside ${!showSidePanel && "is-collapsed"}`}>
          <InviteCollaborator
            setShowSidePanel={setShowSidePanel}
            setShowInviteSuccess={setShowInviteSuccess}
            setShowInviteError={setShowInviteError}
          />
        </aside>
      </div>

      {showRevokeCollaboratorModal && (
        <InviteConfirmationModal
          action="Revoke"
          setShowModal={setShowRevokeCollaboratorModal}
          setShowSuccess={setShowRevokeSuccess}
          setShowError={setShowRevokeError}
          queryKey="collaboratorsData"
        />
      )}

      {showRevokeInviteModal && (
        <InviteConfirmationModal
          action="Revoke"
          setShowModal={setShowRevokeInviteModal}
          setShowSuccess={setShowRevokeSuccess}
          setShowError={setShowRevokeError}
          queryKey="invitesData"
        />
      )}

      {showReopenInviteModal && (
        <InviteConfirmationModal
          action="Reopen"
          setShowModal={setShowReopenInviteModal}
          setShowSuccess={setShowInviteSuccess}
          setShowError={setShowInviteError}
        />
      )}

      {showResendInviteModal && (
        <InviteConfirmationModal
          action="Resend"
          setShowModal={setShowResendInviteModal}
          setShowSuccess={setShowInviteSuccess}
          setShowError={setShowInviteError}
        />
      )}
    </>
  );
}

export default Collaboration;
