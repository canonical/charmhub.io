import { useSetAtom } from "jotai";
import { MainTable } from "@canonical/react-components";
import { useParams } from "react-router-dom";
import { useState } from "react";

import { buildInviteTableRows } from "../../utils";
import type { InviteGroup } from "../../utils/getInviteGroups";

import { activeInviteEmailState } from "../../state/atoms";

type Props = {
  inviteGroups: InviteGroup[];
  setShowRevokeModal: (showRevokeModal: boolean) => void;
  setShowReopenModal: (showReopenModal: boolean) => void;
};

function Invites({
  inviteGroups,
  setShowRevokeModal,
  setShowReopenModal,
}: Props) {
  const setActiveInviteEmail = useSetAtom(activeInviteEmailState);
  const [loadingInviteUrl, setLoadingInviteUrl] = useState<string | null>(null);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState<string | null>(null);

  const { packageName } = useParams();

  // Build each status group separately so its Status cell spans only that group's rows.
  const rows = inviteGroups.flatMap(({ invites, status }) =>
    buildInviteTableRows(
      invites,
      status,
      packageName!,
      setShowRevokeModal,
      setShowReopenModal,
      setActiveInviteEmail,
      loadingInviteUrl,
      setLoadingInviteUrl,
      copiedInviteUrl,
      setCopiedInviteUrl
    )
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
      rows={rows}
    />
  );
}

export default Invites;
