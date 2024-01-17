import React from "react";
import { useParams } from "react-router-dom";
import { MainTable } from "@canonical/react-components";
import { isAfter } from "date-fns";
import { useQueryClient } from "react-query";
import { useRecoilState } from "recoil";

import { useSendInviteMutation } from "../hooks";
import { inviteToRevokeState } from "../atoms";

import { buildInviteTableRows } from "../utils";

import type { Invite } from "../types";

type Props = {
  invites: Array<Invite>;
  setShowRevokeConfirmation: Function;
  inviteCollaborator: Function;
  setInviteLink: Function;
};

function InvitesTable({
  invites,
  setShowRevokeConfirmation,
  setInviteLink,
}: Props) {
  const { packageName } = useParams();
  const queryClient = useQueryClient();

  const [inviteToRevoke, setInviteToRevoke] =
    useRecoilState(inviteToRevokeState);

  const sendInviteMutation = useSendInviteMutation(
    packageName,
    inviteToRevoke,
    window.CSRF_TOKEN,
    queryClient,
    setInviteLink
  );

  const isAccepted = (invite: Invite) => invite?.accepted_at !== null;
  const isRevoked = (invite: Invite) => invite?.revoked_at !== null;
  const isExpired = (invite: Invite) =>
    invite?.expires_at !== null &&
    isAfter(new Date(), new Date(invite?.expires_at));

  const pendingInvites = invites.filter((invite) => {
    return !isAccepted(invite) && !isRevoked(invite) && !isExpired(invite);
  });

  const expiredInvites = invites.filter((invite) => {
    return isExpired(invite);
  });

  const revokedInvites = invites.filter((invite) => {
    return isRevoked(invite) && !isExpired(invite);
  });

  const pendingInviteRows = buildInviteTableRows(
    pendingInvites,
    "Pending",
    setShowRevokeConfirmation,
    setInviteToRevoke,
    sendInviteMutation
  );

  const expiredInviteRows = buildInviteTableRows(
    expiredInvites,
    "Expired",
    setShowRevokeConfirmation,
    setInviteToRevoke,
    sendInviteMutation
  );

  const revokedInviteRows = buildInviteTableRows(
    revokedInvites,
    "Revoked",
    setShowRevokeConfirmation,
    setInviteToRevoke,
    sendInviteMutation
  );

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
      rows={pendingInviteRows.concat(expiredInviteRows, revokedInviteRows)}
    />
  );
}

export default InvitesTable;
