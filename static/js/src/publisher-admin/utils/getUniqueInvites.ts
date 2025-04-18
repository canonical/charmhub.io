import type { Invite } from "../types";

export function getUniqueInvites(invites: Invite[]): Invite[] {
  const map = new Map<string, Invite>();
  invites.forEach((invite) => {
    if (!map.has(invite.email!)) {
      map.set(invite.email!, invite);
    }
  });
  return Array.from(map.values());
}
