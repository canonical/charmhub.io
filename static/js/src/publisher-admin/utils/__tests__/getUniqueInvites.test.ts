import { getUniqueInvites } from "../getUniqueInvites";
import type { Invite } from "../../types";

describe("getUniqueInvites", () => {
  const baseInvite = {
    "accepted-at": null,
    "created-at": "2024-01-01",
    "created-by": {
      "display-name": "John Doe",
      email: "john.doe@canonical.com",
      id: "euSUfXgHfdvA3zpF3h9GgsYNJigzsYjt",
      username: "johndoe",
    },
    email: null,
    "expires-at": null,
    "invite-type": null,
    "revoked-at": null,
  };

  test("returns an empty array if input is empty", () => {
    expect(getUniqueInvites([])).toEqual([]);
  });

  test("returns the same array if all emails are unique", () => {
    const invites: Invite[] = [
      { ...baseInvite, email: "email1@example.com" },
      { ...baseInvite, email: "email2@example.com" },
    ];

    const result = getUniqueInvites(invites);
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.email)).toEqual([
      "email1@example.com",
      "email2@example.com",
    ]);
  });

  test("returns only one invite per unique email", () => {
    const invites: Invite[] = [
      {
        ...baseInvite,
        email: "email1@example.com",
        "created-at": "2024-01-01",
      },
      {
        ...baseInvite,
        email: "email2@example.com",
        "created-at": "2024-01-02",
      },
      {
        ...baseInvite,
        email: "email1@example.com",
        "created-at": "2024-01-03",
      },
    ];

    const result = getUniqueInvites(invites);
    expect(result).toHaveLength(2);
    expect(result.some((invite) => invite.email === "email1@example.com")).toBe(
      true
    );
    expect(result.some((invite) => invite.email === "email2@example.com")).toBe(
      true
    );
  });
});
