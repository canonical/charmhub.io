import buildCharmCard from "./buildCharmCard";

/** Store page filters */
class Charms {
  constructor() {
    this.selectElements();
    this.searchCache = window.location.search;
    this._filters = this.getUrlFilters();

    if (!this._filters.filter && this._filters.platform[0] === "all") {
      setTimeout(() => {
        this.togglePlaceholderContainer();
        this.toggleFeaturedContainer(true);
        this.renderResultsCount(true);
      }, 1000);
    }

    this.fetchCharmsList()
      .then((data) => {
        this.allCharms = data.charms.filter((charm) => charm.type === "charm");

        if (!this.allCharms) {
          return;
        }

        this.filterCharms();
        this.handleShowAllCharmsButton();
        this.handleFilterButtonMobileOpenClick();
        this.handleFilters();
        this.handlePlatformChange();
        this.enableAllActions();
        this.renderButtonMobileOpen();

        if (this._filters.filter || this._filters.platform[0] !== "all") {
          this.renderCharms();
          this.renderResultsCount();
          this.toggleEntityContainer(true);
          this.togglePlaceholderContainer();
          this.toggleShowAllCharmsButton();
        }
      })
      .catch((e) => console.error(e));
  }

  fetchCharmsList() {
    return fetch("/charms.json").then((result) => result.json());
  }

  getUrlFilters() {
    const filters = {};

    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      for (const [filterType, filterValue] of searchParams) {
        filters[filterType] = filterValue.split(",");
      }
    }

    // set the default platform
    if (!filters.platform) {
      filters.platform = ["all"];
    }

    return filters;
  }

  selectElements() {
    this.domEl = {};

    this.domEl.resultsCountContainer = {
      el: document.querySelector("[data-js='results-count-container']"),
      selector: "[data-js='results-count-container']",
    };
    this.domEl.showAllCharmsButton = {
      el: document.querySelector("[data-js='show-all-charms']"),
      selector: "[data-js='show-all-charms']",
    };
    this.domEl.platformSwitcher = {
      el: document.querySelector("[data-js='platform-handler']"),
      selector: "[data-js='platform-handler']",
    };
    this.domEl.categoryFilters = {
      el: document.querySelectorAll(".category-filter"),
      selector: ".category-filter",
    };
    this.domEl.placeholderContainer = {
      el: document.querySelector("[data-js='placeholder-container']"),
      selector: "[data-js='placeholder-container']",
    };
    this.domEl.entityContainer = {
      el: document.querySelector("[data-js='entity-container']"),
      selector: "[data-js='entity-container']",
    };
    this.domEl.featuredContainer = {
      el: document.querySelector("[data-js='featured-container']"),
      selector: "[data-js='featured-container']",
    };
    this.domEl.filterButtonMobileOpen = {
      el: document.querySelector("[data-js='filter-button-mobile-open']"),
      selector: "[data-js='filter-button-mobile-open']",
    };
    this.domEl.filterButtonMobileClose = {
      el: document.querySelector("[data-js='filter-button-mobile-close']"),
      selector: "[data-js='filter-button-mobile-close']",
    };
  }

  handleShowAllCharmsButton() {
    if (this.domEl.showAllCharmsButton.el) {
      this.domEl.showAllCharmsButton.el.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleEntityContainer(true);
        this.renderCharms();
        this.renderResultsCount();
        this.renderButtonMobileOpen();
        this.toggleFeaturedContainer();
        this.toggleShowAllCharmsButton();
        window.scrollTo(0, 0);
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.showAllCharmsButton.selector} selector.`
      );
    }
  }

  renderResultsCount(featured) {
    if (!"content" in document.createElement("template")) {
      return;
    }

    if (this.domEl.resultsCountContainer.el) {
      if (featured) {
        this.domEl.resultsCountContainer.el.innerHTML = `${this.domEl.featuredContainer.el.children.length} Featured`;
      } else {
        this.domEl.resultsCountContainer.el.innerHTML = `${this.charms.length} of ${this.allCharms.length}`;
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.resultsCountContainer.selector} selector.`
      );
    }
  }

  updateHistory() {
    const searchParams = new URLSearchParams();

    Object.keys(this._filters).forEach((filterType) => {
      searchParams.set(filterType, this._filters[filterType].join(","));
    });

    let searchStr = searchParams.toString();

    if (searchStr !== this.searchCache) {
      this.searchCache = searchStr;

      if (searchStr !== "") {
        searchStr = `?${searchStr}`;
      }

      const newUrl = `${window.location.origin}${window.location.pathname}${searchStr}`;

      history.pushState(
        { filters: this._filters },
        null,
        decodeURIComponent(newUrl)
      );
    }
  }

  handlePlatformChange() {
    if (this.domEl.platformSwitcher.el) {
      this.domEl.platformSwitcher.el.addEventListener("change", (e) => {
        this._filters.platform[0] = e.target.value;

        this.filterCharms();
        this.renderCharms();
        this.renderResultsCount();
        this.renderButtonMobileOpen();
        this.updateHistory();
        this.toggleFeaturedContainer();
        this.toggleShowAllCharmsButton();
        this.toggleEntityContainer(true);
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.platformSwitcher.selector} selector.`
      );
    }
  }

  handleFilters() {
    if (this.domEl.categoryFilters.el) {
      this.domEl.categoryFilters.el.forEach((categoryFilter) => {
        if (
          this._filters.filter &&
          this._filters.filter.indexOf(categoryFilter.value) !== -1
        ) {
          categoryFilter.checked = true;
        } else {
          categoryFilter.checked = false;
        }

        categoryFilter.addEventListener("click", () => {
          if (categoryFilter.checked) {
            if (this._filters.filter) {
              this._filters.filter.push(categoryFilter.value);
            } else {
              this._filters["filter"] = [categoryFilter.value];
            }
          } else {
            this._filters.filter = this._filters.filter.filter(
              (el) => el !== categoryFilter.value
            );
            if (this._filters.filter.length === 0) {
              this._filters = {
                platform: this._filters.platform,
              };
            }
          }

          this.filterCharms();
          this.renderCharms();
          this.renderResultsCount();
          this.renderButtonMobileOpen();
          this.renderButtonMobileClose();
          this.updateHistory();
          this.toggleFeaturedContainer();
          this.toggleShowAllCharmsButton();
          this.toggleEntityContainer(true);
        });
      });
    } else {
      throw new Error(
        `There are no elements containing ${this.domEl.categoryFilters.selector} selector.`
      );
    }
  }

  togglePlaceholderContainer(visibility) {
    if (this.domEl.placeholderContainer.el) {
      if (visibility) {
        this.domEl.placeholderContainer.el.classList.remove("u-hide");
      } else {
        this.domEl.placeholderContainer.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.placeholderContainer.selector} selector.`
      );
    }
  }

  toggleEntityContainer(visibility) {
    if (this.domEl.entityContainer.el) {
      if (visibility) {
        this.domEl.entityContainer.el.classList.remove("u-hide");
      } else {
        this.domEl.entityContainer.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.entityContainer.selector} selector.`
      );
    }
  }

  toggleFeaturedContainer(visibility) {
    if (this.domEl.featuredContainer.el) {
      if (visibility) {
        this.domEl.featuredContainer.el.classList.remove("u-hide");
      } else {
        this.domEl.featuredContainer.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.featuredContainer.selector} selector.`
      );
    }
  }

  filterCharms() {
    if (this._filters.platform[0] === "all" && !this._filters.filter) {
      this.charms = this.allCharms;
    } else if (this._filters.platform[0] === "all" && this._filters.filter) {
      this.charms = this.allCharms.filter((charm) =>
        this.filterByCategory(charm)
      );
    } else if (this._filters.platform[0] !== "all" && !this._filters.filter) {
      this.charms = this.allCharms.filter((charm) =>
        charm.store_front.os.includes(this._filters.platform[0])
      );
    } else {
      let charmsFilteredByPlatform = this.allCharms.filter((charm) =>
        charm.store_front.os.includes(this._filters.platform[0])
      );

      this.charms = charmsFilteredByPlatform.filter((charm) =>
        this.filterByCategory(charm)
      );
    }
  }

  filterByCategory(charm) {
    let charmCategories = [];

    if (charm.store_front.categories) {
      charmCategories = charm.store_front.categories.map((cat) => {
        return cat.slug;
      });
    }

    const cats = this._filters.filter.filter((cat) => {
      if (charmCategories.includes(cat)) {
        return cat;
      }
    });

    if (cats.length) {
      return charm;
    }
  }

  renderCharms() {
    if (!"content" in document.createElement("template")) {
      return;
    }

    if (this.domEl.entityContainer.el) {
      this.domEl.entityContainer.el.innerHTML = "";

      this.charms.forEach((charm) => {
        this.domEl.entityContainer.el.appendChild(buildCharmCard(charm));
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.entityContainer.selector} selector.`
      );
    }
  }

  enableAllActions() {
    if (
      this.domEl.platformSwitcher.el &&
      this.domEl.categoryFilters.el &&
      this.domEl.showAllCharmsButton.el
    ) {
      this.domEl.platformSwitcher.el.disabled = false;
      this.domEl.showAllCharmsButton.el.disabled = false;
      this.domEl.categoryFilters.el.forEach((categoryFilter) => {
        categoryFilter.disabled = false;
      });
    }
  }

  toggleShowAllCharmsButton() {
    if (this.domEl.showAllCharmsButton.el) {
      this.domEl.showAllCharmsButton.el.classList.add("u-hide");
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.showAllCharmsButton.selector} selector.`
      );
    }
  }

  handleFilterButtonMobileOpenClick() {
    if (this.domEl.filterButtonMobileOpen.el) {
      this.domEl.filterButtonMobileOpen.el.addEventListener("click", () => {
        this.renderButtonMobileClose();
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.filterButtonMobileOpen.selector} selector.`
      );
    }
  }

  renderButtonMobileClose() {
    if (this.domEl.filterButtonMobileClose.el) {
      if (this._filters.filter) {
        this.domEl.filterButtonMobileClose.el.innerHTML = "Apply filters";
      } else {
        this.domEl.filterButtonMobileClose.el.innerHTML = "Hide filters";
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.filterButtonMobileClose.selector} selector.`
      );
    }
  }

  renderButtonMobileOpen() {
    if (this.domEl.filterButtonMobileOpen.el) {
      const filterSpanEl = this.domEl.filterButtonMobileOpen.el.querySelector(
        "span"
      );
      if (this._filters.filter) {
        filterSpanEl.innerHTML = `Filters (${this._filters.filter.length})`;
      } else {
        filterSpanEl.innerHTML = `Filters`;
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.filterButtonMobileOpen.selector} selector.`
      );
    }
  }
}

export { Charms };
