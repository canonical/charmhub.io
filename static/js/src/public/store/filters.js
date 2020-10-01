/** Store page filters */
class Filters {
  constructor(selectors) {
    this.filteredItems = document.querySelector("[data-js='filtered-items']");
    this.submitButtonMobile = document.querySelector(
      "[data-js='filter-submit']"
    );
    this._filters = this.initFilters();
    this.searchCache = window.location.search;

    this.wrapperEls = {};

    Object.keys(selectors).forEach((selectorName) => {
      const el = document.querySelector(selectors[selectorName]);
      if (el) {
        this.wrapperEls[selectorName] = el;
      }
    });

    this.initEvents();
    this.updateUI();
    this.filterDOM();

    window.addEventListener("popstate", (e) => {
      this._filters = e.state ? e.state.filters : null;
      this.updateUI();
    });
  }

  /**
   * Return the number of active filters
   * without including 'sort' and `q`
   */
  getSelectedFiltersCount() {
    let count = 0;

    if (this._filters) {
      Object.keys(this._filters).forEach((filterType) => {
        if (filterType !== "sort" && filterType !== "q") {
          count += this._filters[filterType].length;
        }
      });
    }

    return count;
  }

  // Check if element shold be filtered
  isFilterMatch(filterText) {
    for (let i = 0; i < Object.keys(this._filters).length; i++) {
      if (
        Object.keys(this._filters)[i] === "category" ||
        Object.keys(this._filters)[i] === "publisher"
      ) {
        for (
          let j = 0;
          j < this._filters[Object.keys(this._filters)[i]].length;
          j++
        ) {
          if (
            filterText.includes(this._filters[Object.keys(this._filters)[i]][j])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  filterDOM() {
    const cardElements = document.querySelectorAll("[data-filter]");
    let filteredItemsNumber = 0;
    if (cardElements) {
      const filterArray = [];
      Object.keys(this._filters).forEach((filterType) => {
        if (filterType === "category" || filterType === "publisher") {
          this._filters[filterType].forEach((el) => {
            filterArray.push(el);
          });
        }
      });

      if (this._filters["category"] || this._filters["publisher"]) {
        cardElements.forEach((cardEl) => {
          const filterText = cardEl.getAttribute("data-filter");
          if (this.isFilterMatch(filterText)) {
            filteredItemsNumber += 1;
            cardEl.classList.remove("u-hide");
          } else {
            cardEl.classList.add("u-hide");
          }
        });
      } else {
        cardElements.forEach((cardEl) => {
          cardEl.classList.remove("u-hide");
          filteredItemsNumber += 1;
        });
      }

      if (this.filteredItems) {
        this.filteredItems.innerHTML = `${filteredItemsNumber} items`;
      }

      if (this.submitButtonMobile) {
        this.submitButtonMobile.innerHTML = `Show results (${filteredItemsNumber})`;
      }
    }
  }

  updateUI() {
    if (this._filters && this._filters.sort) {
      this.wrapperEls.sort.value = this._filters.sort[0];
    }

    // Deselect checkboxes if there are no filters selected
    let selectedFiltersCount = this.getSelectedFiltersCount();

    if (selectedFiltersCount === 0) {
      const activeFilters = this.wrapperEls.filter.querySelectorAll(
        "[data-js='filter']"
      );

      activeFilters.forEach((filter) => {
        filter.firstElementChild.checked = false;
      });
    }

    // Update selected filter count text
    const filterCountTextEl = document.querySelector(
      "[data-filters='applied-filters']"
    );
    const filterMobileButton = document.querySelector(
      "[data-js='mobile-filter-reveal-button']"
    );
    if (filterCountTextEl && filterMobileButton) {
      if (selectedFiltersCount > 0) {
        filterCountTextEl.innerHTML = `Filters (${selectedFiltersCount})`;
        filterMobileButton.innerHTML = `<i class="p-icon--filter"></i>Filters (${selectedFiltersCount})`;
      } else {
        filterCountTextEl.innerHTML = `Filters`;
        filterMobileButton.innerHTML = `<i class="p-icon--filter"></i>Filters`;
      }
    }
  }

  initFilters() {
    const filters = {};

    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      for (const [filterType, filterValue] of searchParams) {
        filters[filterType] = filterValue.split(",");
      }
    }

    return filters;
  }

  addFilter(filterType, filterValue) {
    if (!this._filters[filterType]) {
      this._filters[filterType] = [];
    }

    this._filters[filterType].push(filterValue);
  }

  removeFilter(filterType, filterValue) {
    if (filterValue) {
      const index = this._filters[filterType].indexOf(filterValue);

      this._filters[filterType].splice(index, 1);
    } else {
      this._filters[filterType] = [];
    }
  }

  filterExists(filterType, filterValue) {
    return (
      this._filters[filterType] &&
      this._filters[filterType].indexOf(filterValue) > -1
    );
  }

  cleanFilters() {
    Object.keys(this._filters).forEach((filterType) => {
      if (this._filters[filterType].length === 0) {
        delete this._filters[filterType];
      }
    });
  }

  resetFilters() {
    Object.keys(this._filters).forEach((filterType) => {
      if (filterType !== "sort" && filterType !== "q") {
        delete this._filters[filterType];
      }
    });
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

  syncSortUI(selectorName, newValue) {
    if (selectorName === "sort") {
      this.wrapperEls[selectorName].value = newValue;
    } else if (selectorName === "sortMobile") {
      const options = this.wrapperEls[selectorName].querySelectorAll("input");
      if (options) {
        options.forEach((el) => {
          if (el.value === newValue) {
            el.checked = true;
          } else {
            el.checked = false;
          }
        });
      }
    }
  }

  initSortEvents(el) {
    el.addEventListener("change", (e) => {
      e.preventDefault();
      this.removeFilter("sort");
      this.addFilter("sort", el.value);
      this.syncSortUI("sortMobile", el.value);

      this.cleanFilters();
      this.updateHistory();
      location.reload();
    });
  }

  initMobileSortEvents(el) {
    el.addEventListener("change", (e) => {
      e.preventDefault();
      this.removeFilter("sort");
      this.addFilter("sort", e.target.value);
      this.syncSortUI("sort", e.target.value);

      this.cleanFilters();
      this.updateHistory();
      location.reload();
    });
  }

  initFilterEvents(el) {
    const resetButton = el.querySelector("[data-js='filter-reset']");

    el.addEventListener("click", (e) => {
      let target = e.target.closest("li");

      if (target && target.classList.contains("p-filter__item")) {
        e.preventDefault();

        const filterType = target.dataset.filterType;
        const filterValue = target.dataset.filterValue;

        if (this.filterExists(filterType, filterValue)) {
          this.removeFilter(filterType, filterValue);
          target.firstElementChild.checked = false;
        } else {
          this.addFilter(filterType, filterValue);
          target.firstElementChild.checked = true;
        }

        this.cleanFilters();
        this.updateHistory();
        this.updateUI();
        this.filterDOM();
      }
    });

    el.addEventListener("keyup", (e) => {
      let target = e.target.closest("li");

      const filterType = target.dataset.filterType;
      const filterValue = target.dataset.filterValue;

      if (target && target.classList.contains("p-filter__item")) {
        e.preventDefault();
        if (e.key === "Enter") {
          if (this.filterExists(filterType, filterValue)) {
            this.removeFilter(filterType, filterValue);
            target.firstElementChild.checked = false;
          } else {
            this.addFilter(filterType, filterValue);
            target.firstElementChild.checked = true;
          }
          this.cleanFilters();
          this.updateHistory();
          this.updateUI();
          this.filterDOM();
        }
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", (e) => {
        e.preventDefault();

        this.resetFilters();
        this.updateHistory();
        this.updateUI();
      });
    }

    if (this.submitButtonMobile) {
      this.submitButtonMobile.addEventListener("click", (e) => {
        e.preventDefault();

        el.classList.remove("is-active");
        this.cleanFilters();
      });
    }
  }

  // Close the drawers if click anywhere outside the drawer, except the "Sort by"/"Filters" buttons
  initClickOutside(filter, sortMobile, filterMobileButton, sortMobileButton) {
    document.addEventListener("click", (e) => {
      let targetElement = e.target; // clicked element
      do {
        if (targetElement == filterMobileButton) {
          sortMobile.classList.remove("is-active");
          return;
        } else if (targetElement == sortMobileButton) {
          filter.classList.remove("is-active");
          return;
        } else if (targetElement == filter || targetElement == sortMobile) {
          // This is a click inside. Do nothing, just return.
          return;
        }
        // Go up the DOM
        targetElement = targetElement.parentNode;
      } while (targetElement);

      // This is a click outside.
      filter.classList.remove("is-active");
      sortMobile.classList.remove("is-active");
    });
  }

  initMobileButton(el, targetEl) {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      targetEl.classList.add("is-active");
    });
  }

  resetSearch(mobileSearchEl, desktopSearchEl) {
    mobileSearchEl.querySelector("[type='search']").value = "";
    desktopSearchEl.querySelector("[type='search']").value = "";
  }

  initSearch(mobileSearchEl, desktopSearchEl) {
    mobileSearchEl.addEventListener("reset", (e) => {
      e.preventDefault();
      this.resetSearch(mobileSearchEl, desktopSearchEl);
    });

    desktopSearchEl.addEventListener("reset", (e) => {
      e.preventDefault();
      this.resetSearch(mobileSearchEl, desktopSearchEl);
    });
  }

  initEvents() {
    const {
      filter,
      sort,
      sortMobile,
      sortMobileButton,
      filterMobileButton,
      searchMobile,
      searchDesktop,
    } = this.wrapperEls;
    searchMobile &&
      searchDesktop &&
      this.initSearch(searchMobile, searchDesktop);
    filter && this.initFilterEvents(filter);
    sort && this.initSortEvents(sort);
    sortMobile && this.initMobileSortEvents(sortMobile);
    sortMobileButton && this.initMobileButton(sortMobileButton, sortMobile);
    filterMobileButton && this.initMobileButton(filterMobileButton, filter);
    filter &&
      sortMobile &&
      filterMobileButton &&
      sortMobileButton &&
      this.initClickOutside(
        filter,
        sortMobile,
        filterMobileButton,
        sortMobileButton
      );
  }
}

export { Filters };
