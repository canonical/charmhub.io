import { add } from "date-fns";

import getDisplayedInvitesCount from "../getDisplayedInvitesCount";
import type { Invite } from "../../types";

describe("getDisplayedInvitesCount", () => {
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

    expect(getDisplayedInvitesCount([acceptedInvite])).toBe(0);
  });

  test("counts the invite rows shown in each status section", () => {
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
        "revoked-at": new Date().toISOString(),
      },
      {
        ...baseInvite,
        email: "revoked@example.com",
        "revoked-at": new Date().toISOString(),
      },
    ];

    expect(getDisplayedInvitesCount(invites)).toBe(3);
  });
});
