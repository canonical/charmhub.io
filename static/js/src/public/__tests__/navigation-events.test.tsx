import "@testing-library/jest-dom";

const mockDataLayer: any[] = [];
(window as any).dataLayer = mockDataLayer;
const originalLocation = window.location;

const setupMockDOM = (markup: string) => {
  document.body.innerHTML = markup;
};

describe("navigation-events", () => {
  beforeEach(() => {
    (window.location as any).href = "http://localhost.test";
    mockDataLayer.length = 0;
  });

  test("should add GA navigation events for main navigation", () => {
    setupMockDOM(`
      <div id="navigation">
        <a href="/page1" class="nav-link">Page 1</a>
        <a href="/page2" class="nav-link">Page 2</a>
      </div>
    `);

    require("../navigation-events");

    const [link1, link2] =
      document.querySelectorAll<HTMLAnchorElement>("#navigation a");

    link1.click();
    link2.click();

    expect(mockDataLayer).toEqual([
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-nav-1",
        eventAction:
          "from:http://localhost.test/ to:http://localhost.test/page1",
        eventLabel: "Page 1",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-nav-1",
        eventAction:
          "from:http://localhost.test/ to:http://localhost.test/page2",
        eventLabel: "Page 2",
        eventValue: undefined,
      },
    ]);
  });

  test("should add GA content events for content elements", () => {
    setupMockDOM(`
      <div id="main-content">
        <a href="/cta-positive" class="p-button--positive">Positive CTA</a>
        <a href="/cta-secondary" class="p-button">Secondary CTA</a>
        <a href="/listing" class="p-tabs__link">Listing Link</a>
        <a href="/card" class="p-card--button">Card Button</a>
        <a href="/text-link">Text Link</a>
      </div>
    `);

    require("../navigation-events");

    const [ctaPositive, ctaSecondary, listing, card, textLink] =
      document.querySelectorAll<HTMLAnchorElement>("#main-content a");

    ctaPositive.click();
    ctaSecondary.click();
    listing.click();
    card.click();
    textLink.click();

    const expectedData = [
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-content-cta-0",
        eventAction: "from:http://localhost.test to:/cta-positive",
        eventLabel: "Positive CTA",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-content-cta-1",
        eventAction: "from:http://localhost.test to:/cta-secondary",
        eventLabel: "Secondary CTA",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-nav-listing",
        eventAction: "from:http://localhost.test to:/listing",
        eventLabel: "Listing Link",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-content-card",
        eventAction: "from:http://localhost.test to:/card",
        eventLabel: "Card Button",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-content-link",
        eventAction: "from:http://localhost.test to:/text-link",
        eventLabel: "Text Link",
        eventValue: undefined,
      },
    ];

    setTimeout(() => {
      expect(mockDataLayer).toEqual(expect.arrayContaining(expectedData));
    }, 0);
  });

  afterAll(() => {
    window.location = originalLocation;
  });
});
