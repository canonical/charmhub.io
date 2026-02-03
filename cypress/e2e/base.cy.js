/// <reference types="cypress" />

describe("Test base.js bundle on / page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/");
  });

  it("cookie banner exists", { retries: 2 }, () => {
    cy.window().then(() => {
      cy.get(".cookie-policy").should("exist");
    });
  });
});
