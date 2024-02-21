import React from "react";
import { Button } from "@canonical/react-components";
import { format, isAfter } from "date-fns";

import type { Invite, Collaborator } from "./types";

function buildInviteTableRows(
  invites: Array<Invite>,
  status: "Pending" | "Expired" | "Revoked",
  setShowConfirmation: Function,
  setActiveInvite: Function,
  setAction: Function
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
        className: "u-truncate",
      },
      {
        content: invite?.["created-by"]?.["display-name"],
      },
      {
        content:
          invite?.["expires-at"] &&
          format(new Date(invite?.["expires-at"]), "dd/MM/yyyy"),
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
                    setAction("Revoke");
                    setShowConfirmation(true);
                    setActiveInvite(invite.email);
                  }}
                >
                  Revoke
                </Button>
                <Button
                  type="button"
                  dense
                  onClick={() => {
                    setAction("Resend");
                    setShowConfirmation(true);
                    setActiveInvite(invite.email);
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
                  setAction("Reopen");
                  setShowConfirmation(true);
                  setActiveInvite(invite.email);
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
                  setAction("Reopen");
                  setShowConfirmation(true);
                  setActiveInvite(invite.email);
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

const isAccepted = (invite: Invite) => invite?.["accepted-at"] !== null;
const isRevoked = (invite: Invite) => invite?.["revoked-at"] !== null;
const isExpired = (invite: Invite) =>
  invite?.["expires-at"] !== null &&
  isAfter(new Date(), new Date(invite?.["expires-at"]));
const isPending = (invite: Invite) => {
  return !isAccepted(invite) && !isRevoked(invite) && !isExpired(invite);
};

function getFilteredCollaborators(
  collaborators: Array<Collaborator>,
  filterQuery?: string | null
) {
  if (!filterQuery) {
    return collaborators;
  }

  return collaborators.filter((collaborator: Collaborator) => {
    if (
      (collaborator.account["display-name"] &&
        collaborator.account["display-name"].includes(filterQuery)) ||
      (collaborator.account.email &&
        collaborator.account.email.includes(filterQuery)) ||
      (collaborator.account.username &&
        collaborator.account.username.includes(filterQuery))
    ) {
      return true;
    }

    return false;
  });
}

function getFilteredInvites(
  collaborators: Array<Invite>,
  filterQuery?: string | null
) {
  if (!filterQuery) {
    return collaborators;
  }

  return collaborators.filter((invite: Invite) => {
    if (
      (invite.email && invite.email.includes(filterQuery)) ||
      (invite["created-by"] &&
        invite["created-by"]["display-name"].includes(filterQuery)) ||
      (invite["created-by"] &&
        invite["created-by"].email.includes(filterQuery)) ||
      (invite["created-by"] &&
        invite["created-by"].username.includes(filterQuery))
    ) {
      return true;
    }

    return false;
  });
}

export {
  buildInviteTableRows,
  isAccepted,
  isRevoked,
  isExpired,
  isPending,
  getFilteredCollaborators,
  getFilteredInvites,
};
