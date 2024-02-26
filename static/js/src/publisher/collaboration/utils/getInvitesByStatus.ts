import { isAfter } from "date-fns";

import type { Invite } from "../types";

function getInvitesByStatus(
  invites: Array<Invite>,
  status: "pending" | "expired" | "revoked"
) {
  const isAccepted = (invite: Invite) => invite?.["accepted-at"] !== null;
  const isRevoked = (invite: Invite) => invite?.["revoked-at"] !== null;
  const isExpired = (invite: Invite) =>
    invite?.["expires-at"] !== null &&
    isAfter(new Date(), new Date(invite?.["expires-at"]));

  if (status === "pending") {
    return invites.filter((invite) => {
      return !isAccepted(invite) && !isRevoked(invite) && !isExpired(invite);
    });
  }

  if (status === "expired") {
    return invites.filter((invite) => {
      return isExpired(invite);
    });
  }

  if (status === "revoked") {
    return invites.filter((invite) => {
      return isRevoked(invite) && !isExpired(invite);
    });
  }

  return invites;
}

export default getInvitesByStatus;
