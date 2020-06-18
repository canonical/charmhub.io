import { Tabs } from "./tabs";
import { HistoryState } from "./historyState";

describe("Tabs", () => {
  let testHistoryState, tabEl, tabLinkEl, tabContentEl;

  beforeEach(() => {
    testHistoryState = new HistoryState();
    tabEl = document.createElement("nav");

    tabLinkEl = document.createElement("a");
    tabLinkEl.setAttribute("role", "tab");
    tabLinkEl.setAttribute("aria-controls", "test-tab");

    tabContentEl = document.createElement("div");
    tabContentEl.setAttribute("id", "test-tab");

    tabEl.appendChild(tabLinkEl);
    tabEl.appendChild(tabContentEl);
    document.body.appendChild(tabEl);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should have the 'Tabs' defined", () => {
    const testTabs = new Tabs(document.querySelector("nav"), testHistoryState);
    expect(testTabs).toBeDefined();
  });

  it("should NOT have any the tab selected", () => {
    const testTabs = new Tabs(document.querySelector("nav"), testHistoryState);
    expect(testTabs.getSelected()).toHaveProperty("selected", false);
  });

  it("should have the tab selected and name 'test-tab'", () => {
    document.querySelector("a").setAttribute("aria-selected", "true");
    const testTabs = new Tabs(document.querySelector("nav"), testHistoryState);

    expect(testTabs.getSelected()).toHaveProperty("name", "test-tab");
    expect(testTabs.getSelected()).toHaveProperty("selected", true);
  });

  it("should add 'u-hide' class and remove 'aria-selected' attribute", () => {
    const testTabs = new Tabs(document.querySelector("nav"), testHistoryState);

    testTabs.resetTabUI();

    expect(document.querySelector("div").classList.contains("u-hide")).toEqual(
      true
    );
    expect(document.querySelector("a").hasAttribute("aria-selected")).toEqual(
      false
    );
  });

  it("should update remove 'u-hide' class and add 'aria-selected=true' attribute", () => {
    const testTabs = new Tabs(tabEl, testHistoryState);
    document.querySelector("a").removeAttribute("aria-selected");

    testTabs.updateUI();

    expect(document.querySelector("a").getAttribute("aria-selected")).toEqual(
      "true"
    );
    expect(
      document.querySelector("div").classList.contains("u-hide")
    ).toBeFalsy();
  });
});
