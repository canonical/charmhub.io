import publisherMatchesFilterQuery from "../publisherMatchesFilterQuery";

const publisher = {
  "display-name": "John Doe",
  email: "john.doe@canonical.com",
  id: "euSUfXgHfdvA3zpF3h9GgsYNJigzsYjt",
  username: "johndoe",
};

describe("publisherMatchesFilterQuery", () => {
  test("it returns false if no publisher", () => {
    const result = publisherMatchesFilterQuery(undefined, "john");
    expect(result).toBeFalsy();
  });

  test("it returns false if no filterQuery", () => {
    const result = publisherMatchesFilterQuery(publisher, undefined);
    expect(result).toBeFalsy();
  });

  test("it returns false if publisher doesn't match query", () => {
    const result = publisherMatchesFilterQuery(publisher, "jane");
    expect(result).toBeFalsy();
  });

  test("it returns true if publisher matches query", () => {
    const result = publisherMatchesFilterQuery(publisher, "john");
    expect(result).toBeTruthy();
  });
});
