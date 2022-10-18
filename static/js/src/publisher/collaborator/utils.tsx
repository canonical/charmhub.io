import React from "react";
import { Button } from "@canonical/react-components";
import { format } from "date-fns";

import type { Collaborator, Invite } from "./types";

function getCollaboratorById(
  collaborators: Array<Collaborator>,
  accountId: string
) {
  return collaborators.find(
    (collaborator) => collaborator?.account_id === accountId
  );
}

function buildInviteTableRows(
  collaborators: Array<Collaborator>,
  invites: Array<Invite>,
  status: "Pending" | "Expired" | "Revoked",
  setCollaboratorToRevoke: Function,
  setShowRevokeConfirmation: Function,
  inviteCollaborator: Function
) {
  return invites.map((invite: Invite, index) => {
    let columns: any[] = [];
    let statusColumn;

    if (invites.length > 1 && index === 0) {
      statusColumn = {
        content: (
          <>
            {status === "Pending" && <i className="p-icon--status-waiting" />}
            {status === "Expired" && <i className="p-icon--warning" />}
            {status === "Revoked" && <i className="p-icon--error" />}
            &nbsp;
            {status}
          </>
        ),
        rowSpan: invites.length,
      };
    }

    const remainingColumns = [
      {
        content: invite?.email,
      },
      {
        content: getCollaboratorById(collaborators, invite?.created_by)
          ?.display_name,
      },
      {
        content:
          invite?.expires_at &&
          format(new Date(invite?.expires_at), "dd/MM/yyyy"),
      },
      {
        className: "u-align--right",
        content: (
          <>
            {status === "Pending" && (
              <>
                <Button
                  type="button"
                  dense
                  onClick={() => {
                    setCollaboratorToRevoke(invite?.email);
                    setShowRevokeConfirmation(true);
                  }}
                >
                  Revoke
                </Button>
                <Button
                  type="button"
                  dense
                  onClick={() => {
                    inviteCollaborator(invite?.email);
                  }}
                >
                  Resend
                </Button>
              </>
            )}
            {status === "Expired" && (
              <Button
                type="button"
                dense
                onClick={() => {
                  inviteCollaborator(invite?.email);
                }}
              >
                Reopen
              </Button>
            )}
            {status === "Revoked" && (
              <Button
                type="button"
                dense
                onClick={() => {
                  inviteCollaborator(invite?.email);
                }}
              >
                Reopen
              </Button>
            )}
          </>
        ),
      },
    ];

    if (statusColumn) {
      columns = columns.concat([statusColumn], remainingColumns);
    } else {
      columns = remainingColumns;
    }

    return {
      columns,
    };
  });
}

export { getCollaboratorById, buildInviteTableRows };
