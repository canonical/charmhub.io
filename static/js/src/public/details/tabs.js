class Tabs {
  constructor(el, historyState, children) {
    this.el = el;
    this.tabs = {};
    this.historyState = historyState;
    this.children = children;

    const tabLinks = this.el.querySelectorAll("[role='tab']");

    if (tabLinks.length === 0) {
      throw new Error('Tabs: No elements found with role="tab"');
    }

    tabLinks.forEach((tabLink, i) => {
      const name = tabLink.getAttribute("aria-controls");
      let isSelected = tabLink.hasAttribute("aria-selected");
      const controls = document.querySelector(`#${name}`);

      if (this.historyState.path[0] && this.historyState.path[0] === name) {
        isSelected = true;
      }

      this.tabs[name] = {
        name: name,
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

  popHandler(state) {
    if (state) {
      Object.keys(this.tabs).forEach((tab) => {
        if (tab === state[0]) {
          this.tabs[tab].selected = true;
        } else {
          this.tabs[tab].selected = false;
        }
      });
    } else {
      Object.keys(this.tabs).forEach((tab) => {
        if (this.tabs[tab].index === 0) {
          this.tabs[tab].selected = true;
        } else {
          this.tabs[tab].selected = false;
        }
      });
    }

    this.updateUI();
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

      // If there is an interactive child element, call it's focus method
      // This will set the appropriate URL
      if (this.children[clickedTab] && this.children[clickedTab].focus) {
        this.children[clickedTab].focus();
      } else {
        this.historyState.updatePath(0, clickedTab);
      }
      this.updateUI();
    });
  }
}

export { Tabs };
