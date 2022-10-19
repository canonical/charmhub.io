import React, { useState, useEffect } from "react";
import { MainTable, Button } from "@canonical/react-components";
import { isAfter, format } from "date-fns";

import { getCollaboratorById } from "../utils";

import type { Invite, Collaborator } from "../types";

type Props = {
  invites: Array<Invite>;
  collaborators: Array<Collaborator>;
  setCollaboratorToRevoke: Function;
  setShowRevokeConfirmation: Function;
  setShowResendConfirmation: Function;
  setNewCollaboratorEmail: Function;
};

function InvitesTable({
  invites,
  collaborators,
  setCollaboratorToRevoke,
  setShowRevokeConfirmation,
  setShowResendConfirmation,
  setNewCollaboratorEmail,
}: Props) {
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [expiredInvites, setExpiredInvites] = useState<Invite[]>([]);
  const [revokedInvites, setRevokedInvites] = useState<Invite[]>([]);
  const [pendingInviteRows, setPendingInviteRows] = useState<any[]>([]);
  const [expiredInviteRows, setExpiredInviteRows] = useState<any[]>([]);
  const [revokedInviteRows, setRevokedInviteRows] = useState<any[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const buildInviteTableRows = (
    invites: Array<Invite>,
    status: "Pending" | "Expired" | "Revoked"
  ) => {
    return invites.map((invite: Invite, index) => {
      let columns: any[] = [];
      let statusColumn;

      if (index === 0) {
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
                      setNewCollaboratorEmail(invite?.email);
                      setShowResendConfirmation(true);
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
                    setNewCollaboratorEmail(invite?.email);
                    setShowResendConfirmation(true);
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
                    setNewCollaboratorEmail(invite?.email);
                    setShowResendConfirmation(true);
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
  };

  const isAccepted = (invite: Invite) => invite?.accepted_at !== null;
  const isRevoked = (invite: Invite) => invite?.revoked_at !== null;
  const isExpired = (invite: Invite) =>
    invite?.expires_at !== null &&
    isAfter(new Date(), new Date(invite?.expires_at));

  useEffect(() => {
    setPendingInvites(
      invites.filter((invite) => {
        return !isAccepted(invite) && !isRevoked(invite) && !isExpired(invite);
      })
    );

    setRevokedInvites(
      invites.filter((invite) => {
        return isRevoked(invite) && !isExpired(invite);
      })
    );

    setExpiredInvites(
      invites.filter((invite) => {
        return isExpired(invite);
      })
    );
  }, [invites]);

  useEffect(() => {
    setPendingInviteRows(buildInviteTableRows(pendingInvites, "Pending"));
    setExpiredInviteRows(buildInviteTableRows(expiredInvites, "Expired"));
    setRevokedInviteRows(buildInviteTableRows(revokedInvites, "Revoked"));
  }, [pendingInvites, expiredInvites, revokedInvites]);

  useEffect(() => {
    setTableRows(
      pendingInviteRows.concat(expiredInviteRows, revokedInviteRows)
    );
  }, [pendingInviteRows, expiredInviteRows, revokedInviteRows]);

  return (
    <MainTable
      responsive
      headers={[
        {
          content: "Status",
          heading: "Status",
        },
        {
          content: "Email",
          heading: "Email",
        },
        {
          content: "Sent by",
          heading: "Sent by",
        },
        {
          content: "Expires",
          heading: "Expires",
        },
        {
          content: "",
          heading: "Actions",
        },
      ]}
      rows={tableRows}
    />
  );
}

export default InvitesTable;
