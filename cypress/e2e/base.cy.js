/// <reference types="cypress" />

describe("Test base.js bundle on / page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/");
  });

  it("cookie banner exists", () => {
    cy.window().then(() => {
      cy.get("#cookie-policy-button-accept-all").should("exist");
    });
  });
});
