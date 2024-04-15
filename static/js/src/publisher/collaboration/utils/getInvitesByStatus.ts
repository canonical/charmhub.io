import { isAfter } from "date-fns";

import type { Invite } from "../types";

export const isAccepted = (invite: Invite) => invite?.["accepted-at"] !== null;
export const isRevoked = (invite: Invite) => invite?.["revoked-at"] !== null;
export const isExpired = (invite: Invite) =>
  invite?.["expires-at"] !== null &&
  isAfter(new Date(), new Date(invite?.["expires-at"]));
export const isPending = (invite: Invite) =>
  !isAccepted(invite) && !isRevoked(invite) && !isExpired(invite);

function getInvitesByStatus(
  invites: Array<Invite>,
  status: "pending" | "expired" | "revoked"
) {
  if (status === "pending") {
    return invites.filter((invite) => isPending(invite));
  }

  if (status === "expired") {
    return invites.filter((invite) => isExpired(invite));
  }

  if (status === "revoked") {
    return invites.filter((invite) => isRevoked(invite) && !isExpired(invite));
  }

  return invites;
}

export default getInvitesByStatus;
