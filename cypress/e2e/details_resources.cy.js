/// <reference types="cypress" />

describe("Test details_resources.js bundle on /vault-k8s/resources/vault-image page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/vault-k8s/resources/vault-image");
  });

  it("sets 'window.charmhub'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub).to.equal("object");
    });
  });

  it("sets 'window.charmhub.resources'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.resources).to.equal("object");
    });
  });

  it("sets 'window.charmhub.resources.init'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.resources?.init).to.equal("function");
    });
  });
});
