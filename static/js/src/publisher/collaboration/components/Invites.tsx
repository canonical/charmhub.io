import React from "react";
import { useRecoilValue } from "recoil";
import { MainTable } from "@canonical/react-components";

import getInvitesByStatus from "../utils/getInvitesByStatus";
import buildInviteTableRows from "../utils/buildInviteTableRows";

import { filteredInvitesListState } from "../selectors";

type Props = {
  setShowRevokeModal: Function;
  setShowResendModal: Function;
  setShowReopenModal: Function;
};

function Invites({
  setShowRevokeModal,
  setShowResendModal,
  setShowReopenModal,
}: Props) {
  const invitesList = useRecoilValue(filteredInvitesListState);

  const pendingInvites = getInvitesByStatus(invitesList, "pending");
  const expiredInvites = getInvitesByStatus(invitesList, "expired");
  const revokedInvites = getInvitesByStatus(invitesList, "revoked");

  const pendingInvitesTableRows = buildInviteTableRows(
    pendingInvites,
    "Pending",
    setShowRevokeModal,
    setShowResendModal,
    setShowReopenModal
  );
  const expiredInvitesTableRows = buildInviteTableRows(
    expiredInvites,
    "Expired",
    setShowRevokeModal,
    setShowResendModal,
    setShowReopenModal
  );
  const revokedInvitesTableRows = buildInviteTableRows(
    revokedInvites,
    "Revoked",
    setShowRevokeModal,
    setShowResendModal,
    setShowReopenModal
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
        },
        {
          content: "",
          heading: "Actions",
        },
      ]}
      rows={pendingInvitesTableRows.concat(
        expiredInvitesTableRows,
        revokedInvitesTableRows
      )}
    />
  );
}

export default Invites;
