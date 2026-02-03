/// <reference types="cypress" />

describe("Test interfaces.js bundle on /nginx-ingress-integrator/integrations page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/nginx-ingress-integrator/integrations");
  });

  it("renders correctly", () => {
    cy.get("#tab-content").should("not.be.empty");
  });
});
