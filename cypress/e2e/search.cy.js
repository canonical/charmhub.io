/// <reference types="cypress" />

describe("Test interfaces.js bundle on /all-search page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/all-search?q=nginx ");
  });

  it("renders correctly", () => {
    cy.get("#main-content").should("not.be.empty");
  });
});
