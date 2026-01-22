/// <reference types="cypress" />

describe("Test interfaces.js bundle on / page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/");
  });

  it("renders correctly", () => {
    cy.get("#root").should("not.be.empty");
  });
});
