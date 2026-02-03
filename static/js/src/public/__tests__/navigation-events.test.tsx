import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";

interface GAEvent {
  event: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: string;
}

const mockDataLayer: GAEvent[] = [];
(window as unknown as { dataLayer: GAEvent[] }).dataLayer = mockDataLayer;

const setupMockDOM = (markup: string) => {
  document.body.innerHTML = markup;
};

describe("navigation-events main navigation", () => {
  beforeEach(() => {
    jest.resetModules();
    mockDataLayer.length = 0;
  });

  test("should add GA navigation events for main navigation", async () => {
    setupMockDOM(`
      <div id="navigation">
        <a href="/page1" class="nav-link">Page 1</a>
        <a href="/page2" class="nav-link">Page 2</a>
      </div>
    `);

    await import("../navigation-events");

    const [link1, link2] =
      document.querySelectorAll<HTMLAnchorElement>("#navigation a");

    link1.click();
    link2.click();

    const expectedData = [
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-nav-1",
        eventAction: `from:${window.location.href} to:http://localhost.test/page1`,
        eventLabel: "Page 1",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-nav-1",
        eventAction: `from:${window.location.href} to:http://localhost.test/page2`,
        eventLabel: "Page 2",
        eventValue: undefined,
      },
    ];

    await waitFor(() => {
      expect(mockDataLayer).toEqual(expectedData);
    });
  });
});

describe("navigation-events footer", () => {
  beforeEach(() => {
    jest.resetModules();
    mockDataLayer.length = 0;
  });
  test("should add GA footer navigation events", async () => {
    setupMockDOM(`
      <footer>
        <a href="/footer-link" class="footer-link">Footer Link</a>
      </footer>
    `);

    await import("../navigation-events");

    const footerLink = document.querySelector<HTMLAnchorElement>("footer a");

    footerLink?.click();

    const expectedData = [
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-nav-footer",
        eventAction: `from:${window.location.href} to:http://localhost.test/footer-link`,
        eventLabel: "Footer Link",
        eventValue: undefined,
      },
    ];

    await waitFor(() => {
      expect(mockDataLayer).toEqual(expectedData);
    });
  });
});

describe("navigation-events content", () => {
  beforeEach(() => {
    jest.resetModules();
    mockDataLayer.length = 0;
  });
  test("should add GA content events for content elements", async () => {
    setupMockDOM(`
      <div id="main-content">
        <a href="/cta-positive" class="p-button--positive">Positive CTA</a>
        <a href="/cta-secondary" class="p-button">Secondary CTA</a>
        <a href="/listing" class="p-tabs__link">Listing Link</a>
        <a href="/card" class="p-card--button">Card Button</a>
        <a href="/text-link">Text Link</a>
      </div>
    `);

    await import("../navigation-events");

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
        eventAction: `from:${window.location.href} to:http://localhost.test/cta-positive`,
        eventLabel: "Positive CTA",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-content-cta-1",
        eventAction: `from:${window.location.href} to:http://localhost.test/cta-secondary`,
        eventLabel: "Secondary CTA",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-nav-listing",
        eventAction: `from:${window.location.href} to:http://localhost.test/listing`,
        eventLabel: "Listing Link",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-content-card",
        eventAction: `from:${window.location.href} to:http://localhost.test/card`,
        eventLabel: "Card Button",
        eventValue: undefined,
      },
      {
        event: "GAEvent",
        eventCategory: "charmhub.io-content-link",
        eventAction: `from:${window.location.href} to:http://localhost.test/text-link`,
        eventLabel: "Text Link",
        eventValue: undefined,
      },
    ];

    await waitFor(() => {
      expect(mockDataLayer).toEqual(expectedData);
    });
  });
});
