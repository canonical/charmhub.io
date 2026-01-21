/// <reference types="cypress" />

describe("Test details_overview.js bundle on /nginx-ingress-integrator/ page", () => {
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

  it("sets 'window.charmhub.details.overview'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.details?.overview).to.equal("object");
    });
  });

  it("sets 'window.charmhub.details.overview.init'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.details?.overview?.init).to.equal(
        "function"
      );
    });
  });
});
