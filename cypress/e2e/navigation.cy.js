/// <reference types="cypress" />

describe("Test navigation.js bundle on / page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/");
  });

  it("'All Canonical' dropdown exists", () => {
    cy.window().then(() => {
      cy.get("#all-canonical-link").should("exist");
    });
  });
});
