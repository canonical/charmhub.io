/// <reference types="cypress" />

describe("Test interfaces.js bundle on /icon-validator page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/icon-validator ");
  });

  it("renders correctly", () => {
    cy.get("#main-content").should("not.be.empty");
  });
});
