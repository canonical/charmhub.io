import getInvitesByStatus from "./getInvitesByStatus";
import type { Invite } from "../types";

export type InviteGroup = {
  status: "Pending" | "Expired" | "Revoked";
  invites: Invite[];
};

function getInviteGroups(invites: Invite[]): InviteGroup[] {
  const revokedInvites = Array.from(
    new Map(
      getInvitesByStatus(invites, "revoked").map((invite) => [invite.email, invite])
    ).values()
  );

  return [
    { status: "Pending", invites: getInvitesByStatus(invites, "pending") },
    { status: "Expired", invites: getInvitesByStatus(invites, "expired") },
    { status: "Revoked", invites: revokedInvites },
  ];
}

export default getInviteGroups;
