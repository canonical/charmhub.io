/// <reference types="cypress" />

describe("Test docs-side-nav.js bundle on /pgbouncer/docs/tutorial page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/pgbouncer/docs/tutorial");
    cy.get("#cookie-policy-button-accept-all").click();
  });

  it("side nav is initialized correctly", () => {
    cy.window().then(() => {
      const getDropdown = () =>
        cy
          .get(
            "nav#default .p-side-navigation__item .p-side-navigation__expand"
          )
          .first();

      getDropdown()
        .should("exist")
        .invoke("attr", "aria-expanded")
        .should("eq", "true");

      getDropdown()
        .click()
        .invoke("attr", "aria-expanded")
        .should("eq", "false");
    });
  });
});
