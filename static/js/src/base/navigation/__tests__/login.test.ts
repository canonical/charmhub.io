import "@testing-library/jest-dom";

import "./navigationTemplate";
import setUpNavigation from "./navigationTemplate";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("Navigation login (login.ts)", () => {
  beforeEach(() => {
    jest.resetModules();
    setUpNavigation();

    // Mock fetch for each test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ account: { "display-name": "John Doe" } }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    // Clean up fetch mock
    if ((global.fetch as jest.Mock)?.mockRestore) {
      (global.fetch as jest.Mock).mockRestore();
    }
  });

  test("setupLogin fetches /account.json and updates account display name", async () => {
    const { default: setupLogin } = await import("../login");

    // Call the exported setup function (simulates what DOMContentLoaded-triggered code would do)
    setupLogin();

    // Wait for the fetch promise chain to resolve
    await flushPromises();

    const displayName = document.querySelector(
      ".js-account--name"
    ) as HTMLElement;
    const notAuthenticatedMenu = document.querySelector(
      ".js-nav-account--notauthenticated"
    ) as HTMLElement;
    const authenticatedMenu = document.querySelector(
      ".js-nav-account--authenticated"
    ) as HTMLElement;

    expect(displayName).not.toBeNull();
    expect(displayName.textContent).toBe("John Doe");
    expect(notAuthenticatedMenu.classList).toContain("u-hide");
    expect(authenticatedMenu.classList).not.toContain("u-hide");
  });
});
