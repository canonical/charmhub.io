import throttle from "../../libs/throttle";

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

    window.addEventListener("popstate", (e) => {
      this._filters = e.state ? e.state.filters : null;
      this.updateUI();
    });
  }

  updateUI() {
    if (!this._filters) {
      const activeFilters = this.wrapperEls.filter.querySelectorAll(
        "[data-filter-type][data-filter-value].is-active"
      );
      activeFilters.forEach((filter) => {
        filter.classList.remove("is-active");
        filter
          .querySelector("[data-js='remove-filter']")
          .classList.add("u-hide");
      });

      this.wrapperEls.sort.value = "";

      this.wrapperEls.search.querySelector("[name='q']").value = "";

      return;
    }

    const searchField = this.wrapperEls.search.querySelector("[name='q']");

    if (this._filters.q) {
      searchField.value = this._filters.q[0];
    } else {
      searchField.value = "";
    }

    if (this._filters.sort) {
      this.wrapperEls.sort.value = this._filters.sort[0];
    } else {
      this.wrapperEls.sort.value = "";
    }

    Object.keys(this._filters).forEach((type) => {
      if (type !== "q" && type !== "sort") {
        const activeFilters = this.wrapperEls.filter.querySelectorAll(
          "[data-filter-type][data-filter-value].is-active"
        );
        activeFilters.forEach((filter) => {
          filter.classList.remove("is-active");
          filter
            .querySelector("[data-js='remove-filter']")
            .classList.add("u-hide");
        });

        this._filters[type].forEach((value) => {
          const el = this.wrapperEls.filter.querySelector(
            `[data-filter-type="${type}"][data-filter-value="${value}"]`
          );

          el.classList.add("is-active");
          el.querySelector("[data-js='remove-filter']").classList.remove(
            "u-hide"
          );
        });
      }
    });
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
    if (!filterType && !filterValue) {
      Object.keys(this._filters).forEach((filterType) => {
        if (filterType !== "sort") {
          delete this._filters[filterType];
        }
      });
    } else if (filterValue) {
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

      // hide the drawer once clicked
      el.classList.remove("is-active");
    });
  }

  initFilterEvents(el) {
    const filters = el.querySelectorAll("input");
    const resetButton = el.querySelector("[data-js='filter-reset']");
    const submitButton = el.querySelector("[data-js='filter-submit']");

    if (filters) {
      filters.forEach((filterEl) => {
        filterEl.addEventListener("click", () => {
          const filterType = filterEl.dataset.filterType;
          const filterValue = filterEl.value;

          if (this.filterExists(filterType, filterValue)) {
            this.removeFilter(filterType, filterValue);
          } else {
            this.addFilter(filterType, filterValue);
          }

          this.cleanFilters();
          this.updateHistory();
        });
      });
    }

    // Show shadow when scrolling through the filters on mobile
    const elTitle = el.querySelector("[data-js='js-shadow-title']");
    const elForm = el.querySelector("[data-js='js-shadow-form']");
    if (elTitle && elForm) {
      const contentTop = elForm.getBoundingClientRect().top;
      const toggleShadow = () => {
        // The 0.25 value depends on the maximum height of the ".p-filter" element - it is currently set to 75%
        if (
          el.getBoundingClientRect().top / el.getBoundingClientRect().bottom <=
          0.25
        ) {
          // The value 2 has been arbitrary set because seems to work fine
          if (contentTop - elForm.getBoundingClientRect().top > 2) {
            elTitle.classList.add("has-shadow");
          } else {
            elTitle.classList.remove("has-shadow");
          }
        }
      };
      const onScroll = throttle(() => toggleShadow(), 30);
      el.addEventListener("scroll", onScroll);
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        this.removeFilter();
        this.updateHistory();
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

  initMobileButton(el, targetEl) {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      targetEl.classList.toggle("is-active");
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
  }
}

export { Filters };
