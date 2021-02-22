import buildPackageCard from "./buildPackageCard";

/** Store page filters */
class initPackages {
  constructor() {
    this.selectElements();
    this.togglePlaceholderContainer(true);
    this.searchCache = window.location.search;
    this._filters = this.getUrlFilters();

    if (
      this._filters.filter.length === 0 &&
      this._filters.platform[0] === "all"
    ) {
      this.togglePlaceholderContainer();
      this.toggleFeaturedContainer(true);
      this.renderResultsCount(true);
      this.toggleShowAllPackagesButton(true);
    }

    this.fetchPackageList()
      .then((data) => {
        this.allPackages = data.packages;

        if (!this.allPackages) {
          return;
        }

        this.groupAllPackages();
        this.filterPackages();
        this.handleShowAllPackagesButton();
        this.handleFilterButtonMobileOpenClick();
        this.handleFilterClick();
        this.handlePlatformChange();
        this.enableAllActions();
        this.renderFiltersAndPlatform();
        this.renderButtonMobileOpen();

        console.log(this.groupedPackages);
        if (
          this._filters.filter.length > 0 ||
          this._filters.q.length > 0 ||
          this._filters.platform[0] !== "all"
        ) {
          this.renderPackages();
          this.renderResultsCount();
          this.togglePackageContainer(true);
          this.togglePlaceholderContainer();
          this.toggleShowAllPackagesButton();
        }
      })
      .catch((e) => console.error(e));
  }

  fetchPackageList() {
    if (this._filters.q) {
      const queryUrl = this._filters.q.join(",");
      return fetch(`/packages.json?q=${queryUrl}`).then((result) =>
        result.json()
      );
    } else {
      return fetch("/packages.json").then((result) => result.json());
    }
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

    if (!filters.filter) {
      filters.filter = [];
    }

    if (!filters.q) {
      filters.q = [];
    }

    return filters;
  }

  selectElements() {
    this.domEl = {};

    this.domEl.resultsCountContainer = {
      el: document.querySelector("[data-js='results-count-container']"),
      selector: "[data-js='results-count-container']",
    };
    this.domEl.showAllPackagesButton = {
      el: document.querySelector("[data-js='show-all-packages']"),
      selector: "[data-js='show-all-packages']",
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
    this.domEl.packageContainer = {
      el: document.querySelector("[data-js='package-container']"),
      selector: "[data-js='package-container']",
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

  handleShowAllPackagesButton() {
    if (this.domEl.showAllPackagesButton.el) {
      this.domEl.showAllPackagesButton.el.addEventListener("click", (e) => {
        e.preventDefault();
        this.togglePackageContainer(true);
        this.renderPackages();
        this.renderResultsCount();
        this.renderButtonMobileOpen();
        this.toggleFeaturedContainer();
        this.toggleShowAllPackagesButton();
        window.scrollTo(0, 0);
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.showAllPackagesButton.selector} selector.`
      );
    }
  }

  renderResultsCount(featured) {
    if (!("content" in document.createElement("template"))) {
      return;
    }

    if (this.domEl.resultsCountContainer.el) {
      if (featured) {
        this.domEl.resultsCountContainer.el.innerHTML = `${this.domEl.featuredContainer.el.children.length} Featured`;
      } else {
        this.domEl.resultsCountContainer.el.innerHTML = `${this.packages.length} of ${this.allPackages.length}`;
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
      if (this._filters[filterType].length > 0) {
        searchParams.set(filterType, this._filters[filterType].join(","));
      }
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

        this.filterPackages();
        this.renderFiltersAndPlatform();
        this.renderPackages();
        this.renderResultsCount();
        this.renderButtonMobileOpen();
        this.updateHistory();
        this.toggleFeaturedContainer();
        this.toggleShowAllPackagesButton();
        this.togglePackageContainer(true);
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.platformSwitcher.selector} selector.`
      );
    }
  }

  handleFilterClick() {
    if (this.domEl.categoryFilters.el) {
      this.domEl.categoryFilters.el.forEach((categoryFilter) => {
        if (
          this._filters.filter.length > 0 &&
          this._filters.filter.indexOf(categoryFilter.value) !== -1
        ) {
          categoryFilter.checked = true;
        } else {
          categoryFilter.checked = false;
        }

        categoryFilter.addEventListener("click", () => {
          if (categoryFilter.checked) {
            this._filters.filter.push(categoryFilter.value);
          } else {
            this._filters.filter = this._filters.filter.filter(
              (el) => el !== categoryFilter.value
            );
          }

          this.filterPackages();
          this.renderFiltersAndPlatform();
          this.renderPackages();
          this.renderResultsCount();
          this.renderButtonMobileOpen();
          this.renderButtonMobileClose();
          this.updateHistory();
          this.toggleFeaturedContainer();
          this.toggleShowAllPackagesButton();
          this.togglePackageContainer(true);
        });
      });
    } else {
      throw new Error(
        `There are no elements containing ${this.domEl.categoryFilters.selector} selector.`
      );
    }
  }

  groupAllPackages() {
    this.groupedPackages = {
      categories: {},
    };

    this.allPackages.forEach((entity) => {
      if (entity.store_front.categories) {
        entity.store_front.categories.forEach((cat) => {
          if (!this.groupedPackages.categories[cat.slug]) {
            this.groupedPackages.categories[cat.slug] = {
              linux: [],
              kubernetes: [],
            };
          }
          if (entity.store_front.os.includes("kubernetes")) {
            this.groupedPackages.categories[cat.slug].kubernetes.push(entity);
          } else {
            this.groupedPackages.categories[cat.slug].linux.push(entity);
          }
        });
      }
    });
  }

  renderFiltersAndPlatform() {
    if (this.domEl.categoryFilters.el && this.domEl.platformSwitcher.el) {
      this.domEl.categoryFilters.el.forEach((filter) => {
        let platforms = this.groupedPackages.categories[filter.value];

        if (platforms === undefined) {
          filter.disabled = true;
          return;
        }

        if (this._filters.platform[0] === "all") {
          let count = 0;

          Object.keys(platforms).forEach((platform) => {
            count += platform.length;
          });
          if (count === 0) {
            filter.disabled = true;
          } else {
            filter.disabled = false;
          }
        } else {
          if (platforms[this._filters.platform[0]].length === 0) {
            filter.disabled = true;
          } else {
            filter.disabled = false;
          }
        }
      });

      Array.from(this.domEl.platformSwitcher.el.options).forEach((option) => {
        if (option.value !== "all" && this._filters.filter.length > 0) {
          this._filters.filter.forEach((filter) => {
            if (
              this.groupedPackages.categories[filter] &&
              this.groupedPackages.categories[filter][option.value].length > 0
            ) {
              option.disabled = false;
            } else {
              option.disabled = true;
            }
          });
        } else {
          option.disabled = false;
        }
      });
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

  togglePackageContainer(visibility) {
    if (this.domEl.packageContainer.el) {
      if (visibility) {
        this.domEl.packageContainer.el.classList.remove("u-hide");
      } else {
        this.domEl.packageContainer.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.packageContainer.selector} selector.`
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

  filterPackages() {
    if (
      this._filters.platform[0] === "all" &&
      this._filters.filter.length === 0
    ) {
      this.packages = this.allPackages;
    } else if (
      this._filters.platform[0] === "all" &&
      this._filters.filter.length > 0
    ) {
      this.packages = this.allPackages.filter((entity) =>
        this.filterByCategory(entity)
      );
    } else if (
      this._filters.platform[0] !== "all" &&
      this._filters.filter.length === 0
    ) {
      this.packages = this.allPackages.filter((entity) =>
        entity.store_front.os.includes(this._filters.platform[0])
      );
    } else {
      let pakagesFilteredByPlatform = this.allPackages.filter((entity) =>
        entity.store_front.os.includes(this._filters.platform[0])
      );

      this.packages = pakagesFilteredByPlatform.filter((entity) =>
        this.filterByCategory(entity)
      );
    }
  }

  filterByCategory(entity) {
    let packageCategories = [];

    if (entity.store_front.categories) {
      packageCategories = entity.store_front.categories.map((cat) => {
        return cat.slug;
      });
    }

    const cats = this._filters.filter.filter((cat) => {
      if (packageCategories.includes(cat)) {
        return cat;
      }
    });

    if (cats.length) {
      return entity;
    }
  }

  renderPackages() {
    if (!("content" in document.createElement("template"))) {
      return;
    }

    if (this.domEl.packageContainer.el) {
      this.domEl.packageContainer.el.innerHTML = "";

      this.packages.forEach((entity) => {
        this.domEl.packageContainer.el.appendChild(buildPackageCard(entity));
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.packageContainer.selector} selector.`
      );
    }
  }

  enableAllActions() {
    if (this.domEl.platformSwitcher.el && this.domEl.showAllPackagesButton.el) {
      this.domEl.platformSwitcher.el.disabled = false;
      this.domEl.showAllPackagesButton.el.disabled = false;
    }
  }

  toggleShowAllPackagesButton(visibility) {
    if (this.domEl.showAllPackagesButton.el) {
      if (visibility) {
        this.domEl.showAllPackagesButton.el.classList.remove("u-hide");
      } else {
        this.domEl.showAllPackagesButton.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.showAllPackagesButton.selector} selector.`
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
      if (this._filters.filter.length > 0) {
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
      if (this._filters.filter.length > 0) {
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

export { initPackages };
