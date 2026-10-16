import getInvitesByStatus from "./getInvitesByStatus";
import type { Invite } from "../types";

export type DisplayedInvite = Invite & {
  status: "Pending" | "Expired" | "Revoked";
};

function getDisplayedInvites(invites: Invite[]): DisplayedInvite[] {
  const revokedInvites = Array.from(
    new Map(
      getInvitesByStatus(invites, "revoked").map((invite) => [invite.email, invite])
    ).values()
  );

  return [
    ...getInvitesByStatus(invites, "pending").map(
      (invite): DisplayedInvite => ({ ...invite, status: "Pending" })
    ),
    ...getInvitesByStatus(invites, "expired").map(
      (invite): DisplayedInvite => ({ ...invite, status: "Expired" })
    ),
    ...revokedInvites.map(
      (invite): DisplayedInvite => ({ ...invite, status: "Revoked" })
    ),
  ];
}

export default getDisplayedInvites;
