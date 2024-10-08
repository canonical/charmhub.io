function initTopicFilters() {
  /**
  Toggles the expanded/collapsed classed on side navigation element.
  @param {HTMLElement} sideNavigation The side navigation element.
  @param {Boolean} show Whether to show or hide the drawer.
*/
  function toggleDrawer(sideNavigation: HTMLElement, show: boolean) {
    if (sideNavigation) {
      if (show) {
        sideNavigation.classList.remove("is-collapsed");
        sideNavigation.classList.add("is-expanded");
      } else {
        sideNavigation.classList.remove("is-expanded");
        sideNavigation.classList.add("is-collapsed");
      }
    }
  }

  /**
  Attaches event listeners for the side navigation toggles
  @param {HTMLElement} sideNavigation The side navigation element.
*/
  function setupSideNavigation(sideNavigation: HTMLElement) {
    const toggles: HTMLElement[] = [].slice.call(
      sideNavigation.querySelectorAll(".js-drawer-toggle")
    );

    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        const sideNav = document.getElementById(
          toggle.getAttribute("aria-controls") || ""
        );

        if (sideNav) {
          toggleDrawer(sideNav, !sideNav.classList.contains("is-expanded"));
        }
      });
    });
  }

  /**
  Attaches event listeners for all the side navigations in the document.
  @param {String} sideNavigationSelector The CSS selector matching side navigation elements.
*/
  function setupSideNavigations(sideNavigationSelector: string) {
    // Setup all side navigations on the page.
    const sideNavigations = [].slice.call(
      document.querySelectorAll(sideNavigationSelector)
    );

    sideNavigations.forEach(setupSideNavigation);
  }

  function initFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const checkboxes: HTMLInputElement[] = [].slice.call(
      document.querySelectorAll("[data-js='filter']")
    );
    const topics: HTMLElement[] = [].slice.call(
      document.querySelectorAll("[data-js='item']")
    );
    const closeFiltersButtonMobile = document.querySelector(
      "[data-js='filter-button-mobile-close']"
    ) as HTMLElement;
    let filters: string[] = [];

    if (urlParams.get("filters")) {
      filters = urlParams.get("filters")?.split(",") ?? [];
    }

    populateCheckboxes();
    filterDom();

    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", filterHandler);
    });

    // Check any checkboxes that match URL filters query
    function populateCheckboxes() {
      // Create a list of topics values
      // Dedupe with a set and convert back to an array
      const topicValues = Array.from(
        new Set(
          topics.flatMap(function (topic: HTMLElement) {
            return topic.dataset.filter?.split(",");
          })
        )
      );
      checkboxes.forEach(function (checkbox) {
        const value = checkbox.value;
        if (!topicValues.includes(value)) {
          checkbox.setAttribute("disabled", "disabled");
        }
      });

      if (filters) {
        filters.forEach(function (filter) {
          const selector = "[aria-labelledby='" + filter + "-filter']";
          const checkboxObject = document.querySelector(
            selector
          ) as HTMLInputElement;
          if (checkboxObject) {
            const checkboxDisabled = checkboxObject.getAttribute("disabled");
            if (checkboxDisabled) {
              removeFilter(filter);
            } else {
              checkboxObject.checked = true;
            }
          }
        });
      }
    }

    // Check if element should be filtered
    function filterCheck(filterText: string) {
      const match = false;

      return !!filters.find(function (filter) {
        return filterText.includes(filter) && !match;
      });
    }

    function filterDom() {
      if (filters.length === 0 && topics) {
        closeFiltersButtonMobile.innerHTML = "Hide filters";
        topics.forEach(function (topic) {
          topic.classList.remove("u-hide");
        });
      } else if (topics) {
        closeFiltersButtonMobile.innerHTML = "Apply filters";
        topics.forEach(function (topic) {
          const filterText = topic.getAttribute("data-filter");
          if (filterText && filterCheck(filterText)) {
            topic.classList.remove("u-hide");
          } else {
            topic.classList.add("u-hide");
          }
        });
      }
    }

    function updateUrl() {
      const currentUrl = window.location.href;
      const baseUrl = currentUrl.split("?")[0];
      let newUrl = baseUrl;

      if (filters.length > 0) {
        let filtersString = "";
        filters.forEach(function (filter, i) {
          if (i === filters.length - 1) {
            filtersString = filtersString + filter;
          } else {
            filtersString = filtersString + filter + ",";
          }
        });
        newUrl = baseUrl + "?filters=" + filtersString;
        window.history.pushState({ filters: filters }, "", newUrl);
      } else {
        window.history.pushState({}, "", newUrl);
      }
    }

    function addFilter(filter: string) {
      filters.push(filter);

      filterDom();
      updateUrl();
    }

    function removeFilter(filter: string) {
      filters.splice(filters.indexOf(filter), 1);

      filterDom();
      updateUrl();
    }

    function filterHandler(e: Event) {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        addFilter(target.value);
      } else {
        removeFilter(target.value);
      }
    }
  }

  setupSideNavigations('.p-side-navigation, [class*="p-side-navigation--"]');
  initFilters();

  return {
    toggleDrawer,
  };
}

export { initTopicFilters };
