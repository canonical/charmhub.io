import { useSetRecoilState } from "recoil";
import { format } from "date-fns";
import { Button, MainTable } from "@canonical/react-components";

import { activeInviteEmailState } from "../state/atoms";

import type { Invite } from "../types";
import { generateInviteToken } from "./generateInviteToken";
import { useState } from "react";

type MainTableProps = Parameters<typeof MainTable>[0];
type MainTableRow = NonNullable<MainTableProps["rows"]>[number];
type MainTableCell = NonNullable<MainTableRow["columns"]>[number];

function buildInviteTableRows(
  invites: Array<Invite>,
  status: "Pending" | "Expired" | "Revoked",
  packageName: string,
  setShowRevokeModal: (showRevokeModal: boolean) => void,
  setShowReopenModal: (showReopenModal: boolean) => void
) {
  const setActiveInviteEmail = useSetRecoilState(activeInviteEmailState);
  const [loadingInviteUrl, setLoadingInviteUrl] = useState<string | null>(null);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState<string | null>(null);

  return invites.map((invite: Invite, index) => {
    let columns: MainTableCell[] = [];
    let statusColumn: MainTableCell | undefined;

    if (invites.length > 0 && index === 0) {
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

    const remainingColumns: MainTableCell[] = [
      {
        content: invite?.email,
        className: "u-truncate",
      },
      {
        content: invite?.["created-by"]?.["display-name"],
      },
      {
        content:
          invite?.["expires-at"] &&
          format(new Date(invite?.["expires-at"]), "dd/MM/yyyy"),
      },
      {
        content:
          status === "Pending" ? (
            <Button
              type="button"
              dense
              onClick={() => {
                setActiveInviteEmail(invite?.email || "");
                setShowRevokeModal(true);
              }}
            >
              Revoke
            </Button>
          ) : null,
        className: "u-align--right",
      },
      {
        content:
          status === "Pending" ? (
            <Button
              type="button"
              dense
              disabled={
                loadingInviteUrl === invite.email ||
                copiedInviteUrl === invite.email
              }
              onClick={async () => {
                try {
                  setLoadingInviteUrl(invite.email || "");
                  setCopiedInviteUrl(null);

                  const { inviteLink } = await generateInviteToken(
                    invite.email!,
                    packageName,
                    window.CSRF_TOKEN
                  );

                  await navigator.clipboard.writeText(inviteLink);
                  setLoadingInviteUrl(null);
                  setCopiedInviteUrl(invite.email || "");
                  setTimeout(() => setCopiedInviteUrl(null), 2000);
                } catch (err) {
                  console.error("Failed to generate or copy invite link:", err);
                }
              }}
            >
              {loadingInviteUrl === invite.email ? (
                <i
                  className="p-icon--spinner u-animation--spin"
                  aria-label="Loading"
                />
              ) : copiedInviteUrl === invite.email ? (
                "URL copied!"
              ) : (
                "Copy invite URL"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              dense
              onClick={() => {
                setActiveInviteEmail(invite?.email || "");
                setShowReopenModal(true);
              }}
            >
              Reopen
            </Button>
          ),
        className: "u-align--right",
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
}

export default buildInviteTableRows;
