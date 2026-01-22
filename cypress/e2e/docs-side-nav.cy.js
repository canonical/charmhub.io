/// <reference types="cypress" />

describe("Test docs-side-nav.js bundle on /nginx-ingress-integrator/docs/getting-started page", () => {
  beforeEach(() => {
    cy.visit(
      "http://localhost:8045/nginx-ingress-integrator/docs/getting-started"
    );
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
