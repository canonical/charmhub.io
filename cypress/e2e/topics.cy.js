/// <reference types="cypress" />

describe("Test topics.js bundle on /topics page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8045/topics");
  });

  it("sets 'window.charmhub'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub).to.equal("object");
    });
  });

  it("sets 'window.charmhub.topics'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.topics).to.equal("object");
    });
  });

  it("sets 'window.charmhub.topics.initTopicFilters'", () => {
    cy.window().then((window) => {
      expect(typeof window?.charmhub?.topics?.initTopicFilters).to.equal(
        "function"
      );
    });
  });
});
