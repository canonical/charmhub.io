import React, { useState } from "react";
import ReactDOM from "react-dom";
import { format } from "date-fns";
import {
  Accordion,
  Strip,
  MainTable,
  Button,
  Modal,
  Notification,
} from "@canonical/react-components";

declare global {
  interface Window {
    PACKAGE_NAME: string;
    CSRF_TOKEN: string;
  }
}

type Collaborator = {
  email: string;
  display_name: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string;
  account_id: string;
};

type CollaboratorTableProps = {
  collaborators: Array<Collaborator>;
  setCollaboratorToRevoke: Function;
  setShowRevokeConfirmation: Function;
};

function getUserById(users: Array<Collaborator>, accountId: string) {
  return users.find((user) => user.account_id === accountId);
}

function CollaboratorsTable({
  collaborators,
  setCollaboratorToRevoke,
  setShowRevokeConfirmation,
}: CollaboratorTableProps) {
  return (
    <MainTable
      responsive
      headers={[
        {
          content: "Users",
          heading: "Users",
        },
        {
          content: "Email",
          heading: "Email",
        },
        {
          content: "Added by",
          heading: "Added by",
        },
        {
          content: "Accepted on",
          heading: "Accepted on",
          style: { width: "180px" },
        },
        {
          content: "",
          heading: "Actions",
          style: { width: "140px" },
        },
      ]}
      rows={collaborators.map((collaborator: Collaborator) => {
        return {
          columns: [
            {
              content: collaborator?.display_name,
            },
            {
              content: collaborator?.email,
            },
            {
              content: getUserById(collaborators, collaborator?.created_by)
                ?.display_name,
            },
            {
              content: format(
                new Date(collaborator?.accepted_at),
                "dd/MM/yyyy"
              ),
            },
            {
              content: (
                <Button
                  dense
                  type="button"
                  className="u-no-margin--bottom"
                  onClick={() => {
                    setCollaboratorToRevoke(collaborator?.email);
                    setShowRevokeConfirmation(true);
                  }}
                >
                  Revoke
                </Button>
              ),
              className: "u-align--right",
            },
          ],
        };
      })}
    />
  );
}

function App() {
  const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);
  const [collaboratorToRevoke, setCollaboratorToRevoke] = useState("");
  const [showRevokeSuccess, setShowRevokeSuccess] = useState(false);
  const [showRevokeError, setShowRevokeError] = useState(false);
  const [collaborators, setCollaborators] = useState([
    {
      email: "steve.rydz@canonical.com",
      display_name: "Steve Rydz",
      created_by: "sadf79s7df987sdf",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "sadf79s7df987sdf",
    },
    {
      email: "luke.wesley-holley@canonical.com",
      display_name: "Luke Wesley-Holley",
      created_by: "sadf79s7df987sdf",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "asdfasdfasdf",
    },
    {
      email: "francisco.jimenez.cabrera@canonical.com",
      display_name: "Franciso Jimenez Cabrera",
      created_by: "sadf79s7df987sdf",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "asd;klsdalk;",
    },
    {
      email: "ana.sereijo@canonical.com",
      display_name: "Ana Sereijo",
      created_by: "sadf79s7df987sdf",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "sdfasdfjkljlk",
    },
    {
      email: "ana.badolato.munuera@canonical.com",
      display_name: "Ana Badolato Munuera",
      created_by: "sadf79s7df987sdf",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "sdaflopiupoiu",
    },
    {
      email: "anne-sophie.muller@canonical.com",
      display_name: "Anne-Sophie Muller",
      created_by: "sadf79s7df987sdf",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "klklkjlkjljk",
    },
    {
      email: "huw.wilkins@canonical.com",
      display_name: "Huw Wilkins",
      created_by: "sadf79s7df987sdf",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "asdfdasfjkljkl;jkl;",
    },
    {
      email: "goulin.khoge@canonical.com",
      display_name: "Goulin Khoge",
      created_by: "sadf79s7df987sdf",
      created_at: "2022-03-23T20:03:02",
      expires_at: "2022-04-23T20:03:02",
      accepted_at: "2022-03-23T20:03:02",
      account_id: "kllksdjkllkjlkj",
    },
  ]);

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
        setCollaborators(
          collaborators.filter((collaborator) => collaborator?.email !== email)
        );
        setShowRevokeSuccess(true);
      } else {
        setShowRevokeError(true);
      }
    });
  };

  return (
    <>
      <Strip>
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

        <Accordion
          expanded="collaborators-table"
          sections={[
            {
              key: "collaborators-table",
              title: "Active shares",
              content: (
                <CollaboratorsTable
                  collaborators={collaborators}
                  setCollaboratorToRevoke={setCollaboratorToRevoke}
                  setShowRevokeConfirmation={setShowRevokeConfirmation}
                />
              ),
            },
            {
              title: "Invites",
              content: <div>Invites table will go here</div>,
            },
          ]}
        />
      </Strip>

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
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("main-content"));
