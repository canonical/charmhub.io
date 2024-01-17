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
  invites: Array<Invite>,
  status: "Pending" | "Expired" | "Revoked",
  setShowRevokeConfirmation: Function,
  setInviteToRevoke: Function,
  sendInviteMutation: any
) {
  return invites.map((invite: Invite, index) => {
    let columns: any[] = [];
    let statusColumn;

    if (invites.length > 0 && index === 0) {
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
        content: invite?.created_by,
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
                    setShowRevokeConfirmation(true);
                    setInviteToRevoke(invite.email);
                  }}
                >
                  Revoke
                </Button>
                <Button
                  type="button"
                  dense
                  onClick={() => {
                    setInviteToRevoke(invite.email);
                    sendInviteMutation.mutate(invite.email);
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
                  setInviteToRevoke(invite.email);
                  sendInviteMutation.mutate(invite.email);
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
                  setInviteToRevoke(invite.email);
                  sendInviteMutation.mutate(invite.email);
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
