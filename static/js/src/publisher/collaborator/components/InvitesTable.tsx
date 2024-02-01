import React from "react";
import { MainTable } from "@canonical/react-components";
import { useSetRecoilState } from "recoil";

import { activeInviteState, actionState } from "../atoms";

import {
  buildInviteTableRows,
  isAccepted,
  isRevoked,
  isExpired,
} from "../utils";

import type { Invite } from "../types";

type Props = {
  invites: Array<Invite>;
  setShowConfirmation: Function;
};

function InvitesTable({ invites, setShowConfirmation }: Props) {
  const setActiveInvite = useSetRecoilState(activeInviteState);
  const setAction = useSetRecoilState(actionState);

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
    setShowConfirmation,
    setActiveInvite,
    setAction
  );

  const expiredInviteRows = buildInviteTableRows(
    expiredInvites,
    "Expired",
    setShowConfirmation,
    setActiveInvite,
    setAction
  );

  const revokedInviteRows = buildInviteTableRows(
    revokedInvites,
    "Revoked",
    setShowConfirmation,
    setActiveInvite,
    setAction
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
