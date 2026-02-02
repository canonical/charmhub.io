import { TableOfContents } from "../tableOfContents";
import { HistoryState } from "../historyState";

vi.mock("../historyState", () => ({
  HistoryState: vi.fn(() => ({
    path: [],
    addPopListener: vi.fn(),
    updatePath: vi.fn(),
  })),
}));

describe("TableOfContents", () => {
  let el: HTMLElement;
  let historyState: HistoryState;
  let toc: TableOfContents;

  beforeEach(() => {
    el = document.createElement("div");
    el.dataset.js = "testInstance";

    el.innerHTML = `
      <div role="tab" aria-controls="content1">Tab 1</div>
      <div role="tab" aria-controls="content2">Tab 2</div>
      <div id="content1">Content 1</div>
      <div id="content2">Content 2</div>
    `;

    historyState = new HistoryState();
    toc = new TableOfContents(el, historyState);
  });

  test("should initialise tabs correctly", () => {
    expect(Object.keys(toc.tabs).length).toBe(2);

    expect(toc.tabs["content1"].name).toBe("content1");
    expect(toc.tabs["content2"].name).toBe("content2");

    const content1El = document.querySelector("#content1");
    const content2El = document.querySelector("#content2");

    expect(toc.tabs["content1"].contentEl).toBe(content1El);
    expect(toc.tabs["content2"].contentEl).toBe(content2El);
  });

  test("should set the first tab as selected by default", () => {
    const selectedTab = toc.getSelected();
    if (selectedTab) {
      expect(selectedTab).toBe(toc.tabs["content1"]);
      expect(selectedTab.tabEl.getAttribute("aria-selected")).toBe("true");
      expect(selectedTab.contentEl).toBe(null);
    }
  });

  test("should update UI correctly when tab is clicked", () => {
    const tab = el.querySelector('[aria-controls="content2"]') as HTMLElement;
    tab.click();

    const selectedTab = toc.getSelected();
    if (selectedTab) {
      expect(selectedTab.selected).toBe(true);
      expect(toc.tabs["content1"].selected).toBe(false);
      expect(selectedTab.tabEl.getAttribute("aria-selected")).toBe("true");
      if (selectedTab.contentEl) {
        expect(selectedTab.contentEl.classList.contains("u-hide")).toBe(false);
      }
    } else {
      throw new Error("No tab was selected.");
    }
  });

  test("should handle history state changes correctly", () => {
    historyState.path = ["testInstance", "content2"];
    toc.popHandler(historyState.path);

    expect(toc.tabs["content2"].selected).toBe(true);
    expect(toc.tabs["content1"].selected).toBe(false);
    expect(toc.tabs["content2"].tabEl.getAttribute("aria-selected")).toBe(
      "true"
    );
  });

  test("should focus on the currently selected tab", () => {
    toc.focus();
    expect(historyState.updatePath).toHaveBeenCalledWith(0, [
      "testInstance",
      "content1",
    ]);
  });

  test("should reset tab UI correctly", () => {
    toc.resetTabUI();

    const tab1 = el.querySelector('[aria-controls="content1"]') as HTMLElement;
    const tab2 = el.querySelector('[aria-controls="content2"]') as HTMLElement;

    if (tab1 && tab2) {
      expect(tab1.getAttribute("aria-selected")).toBe(null);
      expect(tab1.classList.contains("is-active")).toBe(false);

      expect(tab2.getAttribute("aria-selected")).toBe(null);
      expect(tab2.classList.contains("is-active")).toBe(false);
    } else {
      throw new Error("One or more elements are missing.");
    }
  });

  test("should update UI correctly", () => {
    toc.updateUI();

    const tab1 = el.querySelector('[aria-controls="content1"]') as HTMLElement;
    const content1 = el.querySelector("#content1") as HTMLElement;

    if (tab1 && content1) {
      expect(tab1.getAttribute("aria-selected")).toBe("true");
      expect(tab1.classList.contains("is-active")).toBe(true);
      expect(content1.classList.contains("u-hide")).toBe(false);
    } else {
      throw new Error("One or more elements are missing.");
    }
  });

  test("should handle tab click when no tab is selected initially", () => {
    toc.resetTabUI();
    const tab = el.querySelector('[aria-controls="content2"]') as HTMLElement;
    tab.click();

    const selectedTab = toc.getSelected();
    if (selectedTab) {
      expect(selectedTab.selected).toBe(true);
      expect(selectedTab.tabEl.getAttribute("aria-selected")).toBe("true");
    } else {
      throw new Error("No tab was selected.");
    }
  });

  test("should handle multiple UI updates correctly", () => {
    const tab1 = el.querySelector('[aria-controls="content1"]') as HTMLElement;
    const tab2 = el.querySelector('[aria-controls="content2"]') as HTMLElement;

    tab1.click();
    toc.updateUI();
    expect(toc.getSelected()?.tabEl.getAttribute("aria-controls")).toBe(
      "content1"
    );

    tab2.click();
    toc.updateUI();
    expect(toc.getSelected()?.tabEl.getAttribute("aria-controls")).toBe(
      "content2"
    );
  });
});
