import { isPending, isExpired, isRevoked } from "../utils";

import type { Invite } from "../types";

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
