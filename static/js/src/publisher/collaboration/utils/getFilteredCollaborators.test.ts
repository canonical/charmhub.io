import getFilteredCollaborators from "./getFilteredCollaborators";

const collaborators = [
  {
    account: {
      "display-name": "John Doe",
      email: "john.doe@canonical.com",
      id: "euSUfXgHfdvA3zpF3h9GgsYNJigzsYjt",
      username: "johndoe",
    },
    "created-at": "2024-01-25T16:16:03Z",
    "created-by": {
      "display-name": "John Doe",
      email: "john.doe@canonical.com",
      id: "euSUfXgHfdvA3zpF3h9GgsYNJigzsYjt",
      username: "johndoe",
    },
    permissions: ["package-collaborator"],
    "updated-at": null,
  },
  {
    account: {
      "display-name": "Jane Doe",
      email: "jane.doe@canonical.com",
      id: "jLy9UChQP04kc6vXSpIgi0igITpcTz78",
      username: "janedoe",
    },
    "created-at": "2024-01-25T15:50:08Z",
    "created-by": {
      "display-name": "Jane Doe",
      email: "jane.doe@canonical.com",
      id: "jLy9UChQP04kc6vXSpIgi0igITpcTz78",
      username: "janedoe",
    },
    permissions: ["package-collaborator"],
    "updated-at": null,
  },
];

describe("getFilteredCollaborators", () => {
  test("it returns all collaborators if no filterQuery parameter", () => {
    const result = getFilteredCollaborators(undefined, collaborators);
    expect(result.length).toEqual(collaborators.length);
    expect(result[0].account.username).toEqual("johndoe");
    expect(result[1].account.username).toEqual("janedoe");
  });

  test("it returns only results where the display name contains the query", () => {
    const result = getFilteredCollaborators("john", collaborators);
    expect(result.length).toEqual(1);
    expect(result[0].account["display-name"]).toEqual("John Doe");
  });

  test("it returns only results where the email contains the query", () => {
    const result = getFilteredCollaborators("ne.doe", collaborators);
    expect(result.length).toEqual(1);
    expect(result[0].account.email).toEqual("jane.doe@canonical.com");
  });
});
