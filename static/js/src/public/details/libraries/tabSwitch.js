class TabSwitch {
  constructor(tabButtonsList, tabContentList) {
    this.tabButtonsList = Array.from(tabButtonsList);
    this.tabContentList = Array.from(tabContentList);
    this.path = window.location.href;

    this.setActiveTab();
    this.initEvents();
    this.hideTitles();
  }

  setActiveTab() {
    const urlHash = window.location.hash;
    // hide all content tabs
    this.tabContentList.forEach((contentTab) => {
      contentTab.classList.add("u-hide");
    });

    // // deselect all navigation tabs
    this.tabButtonsList.forEach((link) => {
      link.classList.remove("is-selected");
    });

    if (urlHash && urlHash !== "#drawer") {
      // show selected content tab
      this.tabContentList.forEach((contentTab) => {
        if ("#" + contentTab.id === urlHash) {
          contentTab.classList.remove("u-hide");
        }
      });
      // select the clicked navigation tab
      this.tabButtonsList.forEach((link) => {
        if (link.getAttribute("data-href") === urlHash) {
          link.classList.add("is-selected");
        }
      });
    } else {
      // show first content tab
      this.tabContentList[0].classList.remove("u-hide");
      this.tabButtonsList[0].classList.add("is-selected");
    }
  }

  hideTitles() {
    this.tabContentList.forEach((contentTab) => {
      const titleEl = contentTab.querySelector("[data-js='source-code-title']");
      if (titleEl) {
        titleEl.classList.add("u-hide");
      }
    });
  }

  initEvents() {
    this.tabButtonsList.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState(null, null, e.target.closest("a").href);
        this.setActiveTab();
      });
    });
  }
}

export { TabSwitch };
