import { useRecoilValue } from "recoil";
import { MainTable } from "@canonical/react-components";

import { getInvitesByStatus, buildInviteTableRows } from "../../utils";

import { filteredInvitesListState } from "../../state/selectors";

type Props = {
  setShowRevokeModal: (showRevokeModal: boolean) => void;
  setShowResendModal: (showResendModal: boolean) => void;
  setShowReopenModal: (showReopenModal: boolean) => void;
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
