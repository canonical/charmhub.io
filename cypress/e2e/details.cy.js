/// <reference types="cypress" />

describe("Test details.js bundle on /nginx-ingress-integrator/ page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/nginx-ingress-integrator/");
  });

  it("sets 'window.charmhub'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub).to.equal("object");
    });
  });

  it("sets 'window.charmhub.details'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.details).to.equal("object");
    });
  });

  it("sets 'window.charmhub.details.init'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.details?.init).to.equal("function");
    });
  });
});
