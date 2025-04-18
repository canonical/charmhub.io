import { useRecoilValue } from "recoil";
import { MainTable } from "@canonical/react-components";
import { useParams } from "react-router-dom";

import { getInvitesByStatus, buildInviteTableRows } from "../../utils";

import { filteredInvitesListState } from "../../state/selectors";

type Props = {
  setShowRevokeModal: (showRevokeModal: boolean) => void;
  setShowReopenModal: (showReopenModal: boolean) => void;
};

function Invites({ setShowRevokeModal, setShowReopenModal }: Props) {
  const invitesList = useRecoilValue(filteredInvitesListState);

  const pendingInvites = getInvitesByStatus(invitesList, "pending");
  const expiredInvites = getInvitesByStatus(invitesList, "expired");
  const revokedInvites = getInvitesByStatus(invitesList, "revoked");
  const uniqueRevokedInvites = Array.from(
    new Map(revokedInvites.map((invite) => [invite.email, invite])).values()
  );

  const { packageName } = useParams();

  const pendingInvitesTableRows = buildInviteTableRows(
    pendingInvites,
    "Pending",
    packageName!,
    setShowRevokeModal,
    setShowReopenModal
  );
  const expiredInvitesTableRows = buildInviteTableRows(
    expiredInvites,
    "Expired",
    packageName!,
    setShowRevokeModal,
    setShowReopenModal
  );
  const revokedInvitesTableRows = buildInviteTableRows(
    uniqueRevokedInvites,
    "Revoked",
    packageName!,
    setShowRevokeModal,
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
          heading: "Revoke",
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
