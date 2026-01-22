/// <reference types="cypress" />

describe("Test interfaces.js bundle on /interfaces page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/interfaces");
  });

  it("renders correctly", () => {
    cy.get("#app").should("not.be.empty");
  });
});
