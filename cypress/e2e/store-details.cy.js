/// <reference types="cypress" />

describe("Test store-details.js bundle on /osm page", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => {
      // this happens when channel map doesn't have filters
      return false;
    });

    cy.visit("http://localhost:8045/osm");
  });

  it("sets 'window.charmhub'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub).to.equal("object");
    });
  });

  it("sets 'window.charmhub.store'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.store).to.equal("object");
    });
  });

  it("sets 'window.charmhub.store.handleBundleIcons'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.store?.handleBundleIcons).to.equal(
        "function"
      );
    });
  });

  it("sets 'window.charmhub.store.initPackages'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.store?.initPackages).to.equal("function");
    });
  });

  it("sets 'window.charmhub.store.initTopics'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.store?.initTopics).to.equal("function");
    });
  });

  it("sets 'window.charmhub.store.loadBundleIcons'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.store?.loadBundleIcons).to.equal(
        "function"
      );
    });
  });
});
