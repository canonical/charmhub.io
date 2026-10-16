import { add } from "date-fns";

import getDisplayedInvites from "../getDisplayedInvites";
import type { Invite } from "../../types";

describe("getDisplayedInvites", () => {
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

  test("returns an empty list when there are no invites", () => {
    expect(getDisplayedInvites([])).toEqual([]);
  });

  test("excludes accepted invites that are not shown in the table", () => {
    const acceptedInvite = {
      ...baseInvite,
      "accepted-at": new Date().toISOString(),
    };

    expect(getDisplayedInvites([acceptedInvite])).toEqual([]);
  });

  test("returns a flat list in status order and deduplicates revoked rows", () => {
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

    expect(
      getDisplayedInvites([invites[2], invites[1], invites[0], invites[3]])
    ).toEqual([
      { ...invites[0], status: "Pending" },
      { ...invites[1], status: "Expired" },
      { ...invites[3], status: "Revoked" },
    ]);
  });
});
