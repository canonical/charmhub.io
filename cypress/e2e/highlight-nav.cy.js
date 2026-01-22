/// <reference types="cypress" />

describe("Test highlight-nav.js bundle on /kafka/actions page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/kafka/actions");
    cy.get("#cookie-policy-button-accept-all").click();
  });

  it("side nav is initialized correctly", () => {
    cy.window().then(() => {
      cy.get(".p-side-navigation .p-side-navigation__link")
        .first()
        .should("exist")
        .invoke("attr", "aria-current")
        .should("eq", "page");

      cy.get(".p-side-navigation .p-side-navigation__link")
        .last()
        .click()
        .invoke("attr", "aria-current")
        .should("eq", "page");
    });
  });
});
