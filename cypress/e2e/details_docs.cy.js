/// <reference types="cypress" />

describe("Test details_docs.js bundle on /nginx-ingress-integrator/docs/getting-started page", () => {
  beforeEach(() => {
    cy.visit(
      "http://localhost:8045/nginx-ingress-integrator/docs/getting-started"
    );
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

  it("sets 'window.charmhub.details.docs'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.details?.docs).to.equal("object");
    });
  });

  it("sets 'window.charmhub.details.docs.initMermaid'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.details?.docs?.initMermaid).to.equal(
        "function"
      );
    });
  });

  it("sets 'window.charmhub.details.docs.initSideNav'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.details?.docs?.initSideNav).to.equal(
        "function"
      );
    });
  });
});
