import getFilteredInvites from "../getFilteredInvites";

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
    "expires-at": "2024-03-27T13:34:06Z",
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
    email: "jane.doe@canonical.com",
    "expires-at": "2024-03-24T15:43:27Z",
    "invite-type": "package-collaborator",
    "revoked-at": null,
  },
];

describe("getFilteredInvites", () => {
  test("it returns all invites if no filterQuery parameter", () => {
    const result = getFilteredInvites(undefined, invites);
    expect(result.length).toEqual(invites.length);
    expect(result[0].email).toEqual("john.doe@canonical.com");
    expect(result[1].email).toEqual("jane.doe@canonical.com");
  });

  test("it returns only results where the email contains the query", () => {
    const result = getFilteredInvites("ne.doe", invites);
    expect(result.length).toEqual(1);
    expect(result[0].email).toEqual("jane.doe@canonical.com");
  });
});
