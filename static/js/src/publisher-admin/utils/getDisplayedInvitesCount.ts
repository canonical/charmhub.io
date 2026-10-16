import getInvitesByStatus from "./getInvitesByStatus";
import { getUniqueInvites } from "./getUniqueInvites";

import type { Invite } from "../types";

function getDisplayedInvitesCount(invites: Invite[]) {
  const pendingInvites = getInvitesByStatus(invites, "pending");
  const expiredInvites = getInvitesByStatus(invites, "expired");
  const revokedInvites = getUniqueInvites(
    getInvitesByStatus(invites, "revoked")
  );

  return pendingInvites.length + expiredInvites.length + revokedInvites.length;
}

export default getDisplayedInvitesCount;
