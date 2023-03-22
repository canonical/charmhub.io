import React, { useState, useEffect } from "react";
import { MainTable } from "@canonical/react-components";
import { isAfter } from "date-fns";

import { buildInviteTableRows } from "../utils";

import type { Invite, Collaborator } from "../types";

type Props = {
  invites: Array<Invite>;
  collaborators: Array<Collaborator>;
  setCollaboratorToRevoke: Function;
  setShowRevokeConfirmation: Function;
  inviteCollaborator: Function;
};

function InvitesTable({
  invites,
  collaborators,
  setCollaboratorToRevoke,
  setShowRevokeConfirmation,
  inviteCollaborator,
}: Props) {
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [expiredInvites, setExpiredInvites] = useState<Invite[]>([]);
  const [revokedInvites, setRevokedInvites] = useState<Invite[]>([]);
  const [pendingInviteRows, setPendingInviteRows] = useState<any[]>([]);
  const [expiredInviteRows, setExpiredInviteRows] = useState<any[]>([]);
  const [revokedInviteRows, setRevokedInviteRows] = useState<any[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);

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
    setPendingInviteRows(
      buildInviteTableRows(
        collaborators,
        pendingInvites,
        "Pending",
        setShowRevokeConfirmation,
        setCollaboratorToRevoke,
        inviteCollaborator
      )
    );

    setExpiredInviteRows(
      buildInviteTableRows(
        collaborators,
        expiredInvites,
        "Expired",
        setShowRevokeConfirmation,
        setCollaboratorToRevoke,
        inviteCollaborator
      )
    );

    setRevokedInviteRows(
      buildInviteTableRows(
        collaborators,
        revokedInvites,
        "Revoked",
        setShowRevokeConfirmation,
        setCollaboratorToRevoke,
        inviteCollaborator
      )
    );
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
