/// <reference types="cypress" />

describe("Test interfaces.js bundle on /integrations page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/integrations");
  });

  it("renders correctly", { retries: 2 }, () => {
    cy.get("#app").should("not.be.empty");
  });
});
