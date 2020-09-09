/** Store page filters */
class Filters {
  constructor(selectors) {
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
    this.sortDOM();

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

    Object.keys(this._filters).forEach((filterType) => {
      if (filterType !== "sort" && filterType !== "q") {
        count += this._filters[filterType].length;
      }
    });

    return count;
  }

  sortDOM() {
    const cardContainer = document.querySelector("[data-js='card-container']");
    if (cardContainer) {
      if (this._filters["sort"]) {
        const allCards = [...cardContainer.children];
        let topicCardList = [];
        let sortableCardList = [];

        allCards.forEach((card) => {
          if (card.getAttribute("data-js") === "topic-card") {
            topicCardList.push(card);
          } else {
            sortableCardList.push(card);
          }
        });

        if (this._filters["sort"][0] === "name-asc") {
          sortableCardList.sort((a, b) => a.id.localeCompare(b.id));
        } else if (this._filters["sort"][0] === "name-desc") {
          sortableCardList.sort((a, b) => -a.id.localeCompare(b.id));
        } else if (this._filters["sort"][0] === "featured") {
          // For now there is no 'featured' field in the API, therefore I cannot
          // sort the cards by 'featured' so I sort them ascending by name
          sortableCardList.sort((a, b) => a.id.localeCompare(b.id));
        }
        cardContainer.innerHTML = "";

        topicCardList.forEach((item) => cardContainer.appendChild(item));
        sortableCardList.forEach((item) => cardContainer.appendChild(item));
      }
    }
  }

  // Check if element shold be filtered
  isFilterMatch(filterText) {
    let match = false;
    Object.keys(this._filters).forEach((filterType) => {
      if (filterType === "category" || filterType === "publisher") {
        this._filters[filterType].forEach((filter) => {
          if (filterText.includes(filter) && !match) {
            match = true;
          }
        });
      }
    });
    return match;
  }

  filterDOM() {
    const cardElements = document.querySelectorAll("[data-filter]");
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
            cardEl.classList.remove("u-hide");
          } else {
            cardEl.classList.add("u-hide");
          }
        });
      } else {
        cardElements.forEach((cardEl) => {
          cardEl.classList.remove("u-hide");
        });
      }
    }
  }

  updateUI() {
    const searchField = this.wrapperEls.search.querySelector("[name='q']");

    if (this._filters.q) {
      searchField.value = this._filters.q[0];
    } else {
      searchField.value = "";
    }
    if (this._filters.sort) {
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

  initSearchEvents(el) {
    el.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(el);
      const q = formData.get("q");

      if (q === "") {
        this.removeFilter("q");
      } else {
        this.removeFilter("q");
        this.addFilter("q", q);
      }

      this.cleanFilters();
      this.updateHistory();
    });
  }

  initSortEvents(el) {
    el.addEventListener("change", (e) => {
      e.preventDefault();
      this.removeFilter("sort");
      this.addFilter("sort", el.value);
      this.syncSortUI("sortMobile", el.value);

      this.cleanFilters();
      this.updateHistory();
      this.sortDOM();
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
      this.sortDOM();

      // hide the drawer once clicked
      el.classList.remove("is-active");
    });
  }

  initFilterEvents(el) {
    const resetButton = el.querySelector("[data-js='filter-reset']");
    const submitButton = el.querySelector("[data-js='filter-submit']");

    el.addEventListener("click", (e) => {
      let target = e.target.closest("li");

      if (target) {
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

    if (resetButton) {
      resetButton.addEventListener("click", (e) => {
        e.preventDefault();

        this.resetFilters();
        this.updateHistory();
        this.updateUI();
      });
    }

    if (submitButton) {
      submitButton.addEventListener("click", (e) => {
        e.preventDefault();

        el.classList.remove("is-active");
        this.cleanFilters();
        this.updateHistory();
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

  initEvents() {
    const {
      filter,
      search,
      sort,
      sortMobile,
      sortMobileButton,
      filterMobileButton,
    } = this.wrapperEls;
    filter && this.initFilterEvents(filter);
    search && this.initSearchEvents(search);
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
