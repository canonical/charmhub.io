import { useAtomValue, useSetAtom } from "jotai";
import { MainTable } from "@canonical/react-components";
import { useParams } from "react-router-dom";
import { useState } from "react";

import { getInvitesByStatus, buildInviteTableRows } from "../../utils";

import { activeInviteEmailState } from "../../state/atoms";
import { filteredInvitesListState } from "../../state/selectors";

type Props = {
  setShowRevokeModal: (showRevokeModal: boolean) => void;
  setShowReopenModal: (showReopenModal: boolean) => void;
};

function Invites({ setShowRevokeModal, setShowReopenModal }: Props) {
  const invitesList = useAtomValue(filteredInvitesListState);
  const setActiveInviteEmail = useSetAtom(activeInviteEmailState);
  const [loadingInviteUrl, setLoadingInviteUrl] = useState<string | null>(null);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState<string | null>(null);

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
    setShowReopenModal,
    setActiveInviteEmail,
    loadingInviteUrl,
    setLoadingInviteUrl,
    copiedInviteUrl,
    setCopiedInviteUrl
  );
  const expiredInvitesTableRows = buildInviteTableRows(
    expiredInvites,
    "Expired",
    packageName!,
    setShowRevokeModal,
    setShowReopenModal,
    setActiveInviteEmail,
    loadingInviteUrl,
    setLoadingInviteUrl,
    copiedInviteUrl,
    setCopiedInviteUrl
  );
  const revokedInvitesTableRows = buildInviteTableRows(
    uniqueRevokedInvites,
    "Revoked",
    packageName!,
    setShowRevokeModal,
    setShowReopenModal,
    setActiveInviteEmail,
    loadingInviteUrl,
    setLoadingInviteUrl,
    copiedInviteUrl,
    setCopiedInviteUrl
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
