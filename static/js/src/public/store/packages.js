import buildPackageCard from "./buildPackageCard";

/** Store page filters */
class initPackages {
  constructor() {
    this.selectElements();
    this.togglePlaceholderContainer(true);
    this.searchCache = window.location.search;
    this._filters = this.getUrlFilters();

    if (
      this._filters.q.length === 0 &&
      this._filters.filter.length === 0 &&
      this._filters.base[0] === "all" &&
      this._filters.type[0] === "all"
    ) {
      this.togglePlaceholderContainer();
      this.toggleFeaturedContainer(true);
      this.renderResultsCount(true);
      this.toggleShowAllPackagesButton(true);
    }

    if (this._filters.q.length > 0) {
      const queryString = this._filters.q.join(",");
      this.domEl.searchInputDesktop.el.value = queryString;
      this.domEl.searchInputMobile.el.value = queryString;
    }

    this.fetchPackageList()
      .then((data) => {
        this.allPackages = data.packages;

        if (!this.allPackages) {
          return;
        }

        // Temporary hack to get bundle icons, as the API does not have it
        this.addBundleApps();
        if (this._filters.q.length > 0) {
          setTimeout(() => {
            this.renderPackages();
          }, 1000);
        }

        this.filterPackages();
        this.handleShowAllPackagesButton();
        this.handleFilterButtonMobileOpenClick();
        this.handleFilterClick();
        this.handlePlatformChange();
        this.handlePackageTypeChange();
        this.enableAllActions();
        this.updateEnabledCategories();
        this.renderButtonMobileOpen();

        if (
          this._filters.q.length > 0 ||
          this._filters.filter.length > 0 ||
          this._filters.base[0] !== "all" ||
          this._filters.type[0] !== "all"
        ) {
          this.renderPackages();
          this.renderResultsCount();
          this.togglePackageContainer(true);
          this.togglePlaceholderContainer();
          this.toggleShowAllPackagesButton();
        }
      })
      .catch((e) => console.error(e));

    this.captureTooltipButtonClick();
  }

  addBundleApps() {
    this.allPackages.forEach((entity, count) => {
      if (entity.type === "bundle") {
        fetch(`/${entity.name}/charms.json`)
          .then((response) => {
            if (response.ok) {
              response.json().then((res) => {
                this.allPackages[count]["apps"] = res.charms;
              });
            } else {
              throw new Error(
                "There was a problem comunicating with the server."
              );
            }
          })
          .catch((e) => console.error(e));
      }
    });
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

    // set the default base
    if (!filters.base) {
      filters.base = ["all"];
    }

    if (!filters.type) {
      filters.type = ["all"];
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
    this.domEl.searchInputDesktop = {
      el: document.querySelector("[data-js='search-input-desktop']"),
      selector: "[data-js='search-input-desktop']",
    };
    this.domEl.searchInputMobile = {
      el: document.querySelector("[data-js='search-input-mobile']"),
      selector: "[data-js='search-input-mobile']",
    };
    this.domEl.showAllPackagesButton = {
      el: document.querySelector("[data-js='show-all-packages']"),
      selector: "[data-js='show-all-packages']",
    };
    this.domEl.baseSwitcher = {
      el: document.querySelector("[data-js='base-handler']"),
      selector: "[data-js='base-handler']",
    };
    this.domEl.packageTypeSwitcher = {
      el: document.querySelector("[data-js='package-type-handler']"),
      selector: "[data-js='package-type-handler']",
    };
    this.domEl.categoryFilters = {
      el: document.querySelectorAll(".category-filter"),
      selector: ".category-filter",
    };
    this.domEl.placeholderContainer = {
      el: document.querySelector("[data-js='packages-placeholder-container']"),
      selector: "[data-js='packages-placeholder-container']",
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
      } else if (this._filters.q.length > 0) {
        this.domEl.resultsCountContainer.el.innerHTML = `${
          this.packages.length
        } of ${
          this.allPackages.length
        } search results for <span style='font-weight: 500;'>'${this._filters.q.join(
          ","
        )}'</span>`;
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
    if (this.domEl.baseSwitcher.el) {
      this.domEl.baseSwitcher.el.addEventListener("change", (e) => {
        this._filters.base[0] = e.target.value;

        this.filterPackages();
        this.updateEnabledCategories();
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
        `There is no element containing ${this.domEl.baseSwitcher.selector} selector.`
      );
    }
  }

  handlePackageTypeChange() {
    if (this.domEl.packageTypeSwitcher.el) {
      this.domEl.packageTypeSwitcher.el.addEventListener("change", (e) => {
        this._filters.type[0] = e.target.value;

        this.filterPackages();
        this.updateEnabledCategories();
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
        `There is no element containing ${this.domEl.packageTypeSwitcher.selector} selector.`
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
          this.updateEnabledCategories();
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

  updateEnabledCategories() {
    // Enable all categories by default
    this.domEl.categoryFilters.el.forEach((filter) => {
      filter.disabled = false;
    });

    // If the user is searching or using filters
    if (
      this._filters.q.length > 0 ||
      this._filters.base[0] !== "all" ||
      this._filters.type[0] !== "all"
    ) {
      const categories = [];

      this.filteredPackagesAllCategories.forEach((entity) => {
        if (entity.store_front.categories) {
          entity.store_front.categories.forEach((cat) => {
            if (!categories.includes(cat.slug)) {
              categories.push(cat.slug);
            }
          });
        }
      });

      // We hide categories without results
      this.domEl.categoryFilters.el.forEach((filter) => {
        if (categories.includes(filter.value)) {
          filter.disabled = false;
        } else {
          filter.disabled = true;
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
    this.packages = this.allPackages;

    if (this._filters.base[0] !== "all") {
      this.packages = this.packages.filter((entity) =>
        entity.store_front["deployable-on"].includes(this._filters.base[0])
      );
    }

    if (this._filters.type[0] !== "all") {
      this.packages = this.packages.filter((entity) =>
        entity["type"].includes(this._filters.type[0])
      );
    }

    this.filteredPackagesAllCategories = this.packages;

    if (this._filters.filter.length > 0) {
      this.packages = this.packages.filter((entity) =>
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

      const contents = this.domEl.packageContainer.el.querySelectorAll(
        ".p-card__content"
      );

      const ensureBundleCharmsFit = () => {
        const contentStyles = window.getComputedStyle(contents[0], null);
        const paddingX = Math.round(
          parseInt(contentStyles.getPropertyValue("padding-left")) +
            parseInt(contentStyles.getPropertyValue("padding-right")) +
            parseInt(contentStyles.getPropertyValue("border-left-width")) +
            parseInt(contentStyles.getPropertyValue("border-right-width"))
        );
        const paddingY = Math.round(
          parseInt(contentStyles.getPropertyValue("padding-top")) +
            parseInt(contentStyles.getPropertyValue("padding-bottom")) +
            parseInt(contentStyles.getPropertyValue("border-top-width")) +
            parseInt(contentStyles.getPropertyValue("border-bottom-width"))
        );

        const contentsBox = contents[0].getBoundingClientRect();
        const innerWidth = contentsBox.width - paddingX;
        const innerHeight = contentsBox.height - paddingY;

        contents.forEach((content) => {
          const icons = Array.from(content.querySelectorAll("img"));
          const icon = icons[0];
          if (icon) {
            const container = icon.parentNode;
            const iconBox = icon.getBoundingClientRect();
            const iconStyles = window.getComputedStyle(icon, null);
            const iconWidth = Math.round(
              iconBox.width +
                parseInt(iconStyles.getPropertyValue("border-left-width")) +
                parseInt(iconStyles.getPropertyValue("border-right-width")) +
                parseInt(iconStyles.getPropertyValue("margin-left")) +
                parseInt(iconStyles.getPropertyValue("margin-right"))
            );
            const iconHeight = Math.round(
              iconBox.height +
                parseInt(iconStyles.getPropertyValue("border-top-width")) +
                parseInt(iconStyles.getPropertyValue("border-bottom-width")) +
                parseInt(iconStyles.getPropertyValue("margin-top")) +
                parseInt(iconStyles.getPropertyValue("margin-bottom"))
            );
            if (iconWidth && innerWidth && iconHeight && innerHeight) {
              const maxIconsX = Math.floor(innerWidth / iconWidth);
              const maxIconsY = Math.floor(innerHeight / iconHeight);
              const maxIcons = maxIconsX * maxIconsY - 1;
              const removedIcons = icons.length - maxIcons;
              icons.forEach((icon, index) => {
                if (index >= maxIcons) {
                  icon.classList.add("u-hide");
                } else {
                  icon.classList.remove("u-hide");
                }
              });
              if (removedIcons > 0) {
                let extraCount = container.querySelector(
                  ".p-bundle-icons__count"
                );
                if (!extraCount) {
                  extraCount = document.createElement("span");
                  extraCount.setAttribute(
                    "class",
                    "p-bundle-icons__count u-text--muted"
                  );
                  container.appendChild(extraCount);
                }
                extraCount.innerHTML = `+${removedIcons}`;
              }
            }
          }
        });
      };

      ensureBundleCharmsFit();

      window.removeEventListener("resize", ensureBundleCharmsFit);
      window.addEventListener("resize", ensureBundleCharmsFit);

      this.captureTooltipButtonClick();
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.packageContainer.selector} selector.`
      );
    }
  }

  enableAllActions() {
    if (
      this.domEl.baseSwitcher.el &&
      this.domEl.showAllPackagesButton.el &&
      this.domEl.packageTypeSwitcher.el
    ) {
      this.domEl.baseSwitcher.el.disabled = false;
      this.domEl.packageTypeSwitcher.el.disabled = false;
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

  captureTooltipButtonClick() {
    const charmCardButtons = document.querySelectorAll(
      "[data-js-functionality-button]"
    );

    charmCardButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }
}

export { initPackages };
