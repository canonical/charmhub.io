class TableOfContents {
  constructor(el, historyState) {
    this.el = el;
    this.instanceName = el.dataset.js;
    this.tabs = {};
    this.historyState = historyState;

    const tabLinks = this.el.querySelectorAll("[role='tab']");

    tabLinks.forEach((tabLink, i) => {
      const name = tabLink.getAttribute("aria-controls");
      let isSelected = tabLink.hasAttribute("aria-selected");
      const controls = document.querySelector(`#${name}`);

      if (
        this.historyState.path.length === 2 &&
        this.historyState.path[0] === this.instanceName &&
        this.historyState.path[1] === name
      ) {
        isSelected = true;
      }

      this.tabs[name] = {
        name,
        tabEl: tabLink,
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
    this.historyState.updatePath(0, [
      this.instanceName,
      this.getSelected().name,
    ]);
  }

  popHandler(state) {
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

  getSelected() {
    let selected;

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
      this.tabs[tab].tabEl.removeAttribute("aria-selected");
      this.tabs[tab].tabEl.classList.remove("is-active");
      if (this.tabs[tab].contentEl) {
        this.tabs[tab].contentEl.classList.add("u-hide");
      }
    });
  }

  updateUI() {
    this.resetTabUI();
    const selectedTab = this.getSelected();

    if (selectedTab) {
      selectedTab.tabEl.setAttribute("aria-selected", true);
      selectedTab.tabEl.classList.add("is-active");
      selectedTab.contentEl.classList.remove("u-hide");
    }
  }

  initEvents() {
    this.el.addEventListener("click", (e) => {
      e.preventDefault();
      const clickedTab = e.target.getAttribute("aria-controls");
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
