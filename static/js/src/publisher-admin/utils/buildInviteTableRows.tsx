import { useSetRecoilState } from "recoil";
import { format } from "date-fns";
import { Button } from "@canonical/react-components";

import { activeInviteEmailState } from "../state/atoms";

import type { Invite } from "../types";

function buildInviteTableRows(
  invites: Array<Invite>,
  status: "Pending" | "Expired" | "Revoked",
  setShowRevokeModal: Function,
  setShowResendModal: Function,
  setShowReopenModal: Function
) {
  const setActiveInviteEmail = useSetRecoilState(activeInviteEmailState);

  return invites.map((invite: Invite, index) => {
    let columns: any[] = [];
    let statusColumn;

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

    const remainingColumns = [
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
        className: "u-align--right",
        content: (
          <>
            {status === "Pending" && (
              <>
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
                <Button
                  type="button"
                  dense
                  onClick={() => {
                    setActiveInviteEmail(invite?.email || "");
                    setShowResendModal(true);
                  }}
                >
                  Resend
                </Button>
              </>
            )}
            {status === "Expired" && (
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
            )}
            {status === "Revoked" && (
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
            )}
          </>
        ),
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
