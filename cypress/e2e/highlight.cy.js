/// <reference types="cypress" />

describe("Test highlight.js bundle on /kafka page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/kafka");
  });

  it("code is highlighted correctly", () => {
    cy.window().then(() => {
      cy.get("code .token").should("exist");
    });
  });
});
