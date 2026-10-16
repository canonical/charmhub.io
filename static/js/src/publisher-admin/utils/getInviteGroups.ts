import getInvitesByStatus from "./getInvitesByStatus";
import type { Invite } from "../types";

export type InviteGroup = {
  status: "Pending" | "Expired" | "Revoked";
  invites: Invite[];
};

// Share the displayed invite groups between the header count and the table so
// status filtering and deduplication cannot drift apart.
function getInviteGroups(invites: Invite[]): InviteGroup[] {
  // Preserve the table's one revoked row per email, unlike pending/expired rows.
  // The Map keeps the last revoked invite in input order, not necessarily the newest.
  const revokedInvites = Array.from(
    new Map(
      getInvitesByStatus(invites, "revoked").map((invite) => [
        invite.email,
        invite,
      ])
    ).values()
  );

  return [
    { status: "Pending", invites: getInvitesByStatus(invites, "pending") },
    { status: "Expired", invites: getInvitesByStatus(invites, "expired") },
    { status: "Revoked", invites: revokedInvites },
  ];
}

export default getInviteGroups;
