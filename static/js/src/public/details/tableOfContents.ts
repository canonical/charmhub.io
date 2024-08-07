import { HistoryState } from "./historyState";

interface Tab {
  name: string;
  tabEl: HTMLElement;
  selected: boolean;
  index: number;
  contentEl: HTMLElement | null;
}

class TableOfContents {
  el: HTMLElement;
  instanceName: string;
  tabs: { [key: string]: Tab };
  historyState: HistoryState;

  constructor(el: HTMLElement, historyState: HistoryState) {
    this.el = el;
    this.instanceName = el.dataset.js as string;
    this.tabs = {};
    this.historyState = historyState;

    const tabLinks = this.el.querySelectorAll("[role='tab']");

    tabLinks.forEach((tabLink, i) => {
      const name = tabLink.getAttribute("aria-controls") as string;
      let isSelected = tabLink.hasAttribute("aria-selected");
      const controls = document.querySelector(`#${name}`) as HTMLElement | null;

      if (
        this.historyState.path.length === 2 &&
        this.historyState.path[0] === this.instanceName &&
        this.historyState.path[1] === name
      ) {
        isSelected = true;
      }

      this.tabs[name] = {
        name,
        tabEl: tabLink as HTMLElement,
        selected: isSelected,
        index: i,
        contentEl: controls,
      };
    });

    this.updateUI();
    this.initEvents();
    this.historyState.addPopListener(this.popHandler.bind(this));
  }

  focus() {
    const selectedTab = this.getSelected();
    if (selectedTab) {
      this.historyState.updatePath(0, [this.instanceName, selectedTab.name]);
    }
  }

  popHandler(state: Array<string>) {
    if (state) {
      if (state.length === 2 && this.instanceName === state[0]) {
        Object.keys(this.tabs).forEach((tab) => {
          if (tab === state[1]) {
            this.tabs[tab].selected = true;
          } else {
            this.tabs[tab].selected = false;
          }
        });

        this.updateUI();
      }
    }
  }

  getSelected(): Tab | undefined {
    let selected: Tab | undefined;

    Object.keys(this.tabs).forEach((tab) => {
      if (this.tabs[tab].selected) {
        selected = this.tabs[tab];
      }
    });

    if (!selected) {
      Object.keys(this.tabs).forEach((tab) => {
        if (this.tabs[tab].index === 0) {
          selected = this.tabs[tab];
        }
      });
    }

    return selected;
  }

  resetTabUI() {
    Object.keys(this.tabs).forEach((tab) => {
      const tabData = this.tabs[tab];
      if (tabData.tabEl) {
        tabData.tabEl.removeAttribute("aria-selected");
        tabData.tabEl.classList.remove("is-active");
      }
      if (tabData.contentEl) {
        tabData.contentEl.classList.add("u-hide");
      }
    });
  }

  updateUI() {
    this.resetTabUI();
    const selectedTab = this.getSelected();

    if (selectedTab) {
      if (selectedTab.tabEl) {
        selectedTab.tabEl.setAttribute("aria-selected", "true");
        selectedTab.tabEl.classList.add("is-active");
      }
      if (selectedTab.contentEl) {
        selectedTab.contentEl.classList.remove("u-hide");
      }
    }
  }

  initEvents() {
    this.el.addEventListener("click", (e) => {
      e.preventDefault();
      const clickedTab = (e.target as HTMLElement).getAttribute(
        "aria-controls"
      );
      if (clickedTab) {
        Object.keys(this.tabs).forEach((tab) => {
          if (tab === clickedTab) {
            this.tabs[tab].selected = true;
          } else {
            this.tabs[tab].selected = false;
          }
        });
      }

      this.historyState.updatePath(1, clickedTab);
      this.updateUI();
    });
  }
}

export { TableOfContents };
