import { add } from "date-fns";

import getInviteGroups from "../getInviteGroups";
import type { Invite } from "../../types";

describe("getInviteGroups", () => {
  const baseInvite: Invite = {
    "accepted-at": null,
    "created-at": "2024-01-01",
    "created-by": {
      "display-name": "John Doe",
      email: "john.doe@canonical.com",
      id: "euSUfXgHfdvA3zpF3h9GgsYNJigzsYjt",
      username: "johndoe",
    },
    email: "invite@example.com",
    "expires-at": add(new Date(), { days: 1 }).toISOString(),
    "invite-type": "package-collaborator",
    "revoked-at": null,
  };

  test("excludes accepted invites that are not shown in the table", () => {
    const acceptedInvite = {
      ...baseInvite,
      "accepted-at": new Date().toISOString(),
    };

    expect(getInviteGroups([acceptedInvite])).toEqual([
      { status: "Pending", invites: [] },
      { status: "Expired", invites: [] },
      { status: "Revoked", invites: [] },
    ]);
  });

  test("groups displayed invites and deduplicates revoked rows", () => {
    const invites: Invite[] = [
      { ...baseInvite, email: "pending@example.com" },
      {
        ...baseInvite,
        email: "expired@example.com",
        "expires-at": "2020-01-01T00:00:00Z",
      },
      {
        ...baseInvite,
        email: "revoked@example.com",
        "created-at": "2024-01-02",
        "revoked-at": new Date().toISOString(),
      },
      {
        ...baseInvite,
        email: "revoked@example.com",
        "revoked-at": new Date().toISOString(),
      },
    ];

    expect(getInviteGroups(invites)).toEqual([
      { status: "Pending", invites: [invites[0]] },
      { status: "Expired", invites: [invites[1]] },
      { status: "Revoked", invites: [invites[3]] },
    ]);
  });
});
