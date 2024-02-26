import { add } from "date-fns";

import getInvitesByStatus from "./getInvitesByStatus";

const invites = [
  {
    "accepted-at": null,
    "created-at": "2024-02-26T13:34:06Z",
    "created-by": {
      "display-name": "John Smith",
      email: "john.smith@canonical.com",
      id: "prFvYmbaBhQbXLNaHa4FV4SAcJ8zh0Ej",
      username: "johnsmith",
    },
    email: "john.doe@canonical.com",
    "expires-at": add(new Date(), { days: 1 }).toString(),
    "invite-type": "package-collaborator",
    "revoked-at": null,
  },
  {
    "accepted-at": "2024-02-23T15:43:27Z",
    "created-at": "2024-02-23T15:43:27Z",
    "created-by": {
      "display-name": "Jane Smith",
      email: "jane.smith@canonical.com",
      id: "88KaoMOUgYR4Pj7M2tY6uhEQz4LGSU6Q",
      username: "janesmith",
    },
    email: "jane.doe@canonical.com",
    "expires-at": "2023-03-24T15:43:27Z",
    "invite-type": "package-collaborator",
    "revoked-at": null,
  },
  {
    "accepted-at": null,
    "created-at": "2024-02-23T15:43:27Z",
    "created-by": {
      "display-name": "Jane Smith",
      email: "jane.smith@canonical.com",
      id: "88KaoMOUgYR4Pj7M2tY6uhEQz4LGSU6Q",
      username: "janesmith",
    },
    email: "jane.smith@canonical.com",
    "expires-at": add(new Date(), { days: 1 }).toString(),
    "invite-type": "package-collaborator",
    "revoked-at": "2023-03-24T15:43:27Z",
  },
];

describe("getInvitesByStatus", () => {
  test("it returns only pending invites if status is 'pending'", () => {
    const result = getInvitesByStatus(invites, "pending");
    expect(result.length).toEqual(1);
    expect(result[0].email).toEqual("john.doe@canonical.com");
  });

  test("it returns only expired invites if status is 'expired'", () => {
    const result = getInvitesByStatus(invites, "expired");
    expect(result.length).toEqual(1);
    expect(result[0].email).toEqual("jane.doe@canonical.com");
  });

  test("it returns only revoked invites if status is 'revoked'", () => {
    const result = getInvitesByStatus(invites, "revoked");
    expect(result.length).toEqual(1);
    expect(result[0].email).toEqual("jane.smith@canonical.com");
  });
});
