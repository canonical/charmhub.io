import { useSetAtom } from "jotai";
import { MainTable } from "@canonical/react-components";
import { useParams } from "react-router-dom";
import { useState } from "react";

import { buildInviteTableRows } from "../../utils";
import type { DisplayedInvite } from "../../utils/getDisplayedInvites";

import { activeInviteEmailState } from "../../state/atoms";

type Props = {
  invites: DisplayedInvite[];
  setShowRevokeModal: (showRevokeModal: boolean) => void;
  setShowReopenModal: (showReopenModal: boolean) => void;
};

function Invites({ invites, setShowRevokeModal, setShowReopenModal }: Props) {
  const setActiveInviteEmail = useSetAtom(activeInviteEmailState);
  const [loadingInviteUrl, setLoadingInviteUrl] = useState<string | null>(null);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState<string | null>(null);

  const { packageName } = useParams();

  const rows = buildInviteTableRows(
    invites,
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
      rows={rows}
    />
  );
}

export default Invites;
