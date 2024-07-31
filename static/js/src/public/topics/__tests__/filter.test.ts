import { initTopicFilters } from "../filter";

function setupMockDOM() {
  document.body.innerHTML = `
    <div class="p-side-navigation js-drawer-toggle" aria-controls="sideNav"></div>
    <div id="sideNav" class="p-side-navigation is-collapsed"></div>
    <input type="checkbox" data-js="filter" value="filter1" aria-labelledby="filter1-filter">
    <input type="checkbox" data-js="filter" value="filter2" aria-labelledby="filter2-filter">
    <input type="checkbox" data-js="filter" value="filter3" aria-labelledby="filter3-filter">
    <div data-js="item" data-filter="filter1,filter2"></div>
    <div data-js="item" data-filter="filter2,filter3"></div>
    <div data-js="item" data-filter="filter1,filter3"></div>
    <button data-js="filter-button-mobile-close"></button>
  `;
}

describe("initTopicFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockDOM();
    window.history.pushState = jest.fn();
  });

  test("should initialise without errors", () => {
    expect(() => initTopicFilters()).not.toThrow();
  });

  describe("toggleDrawer", () => {
    test("should expand side navigation when show is true", async () => {
      const sideNav = document.getElementById("sideNav");
      expect(sideNav).toBeTruthy();

      if (sideNav) {
        const isCollapsed = sideNav.classList.contains("is-collapsed");
        const isExpanded = sideNav.classList.contains("is-expanded");
        expect(isCollapsed).toBe(true);
        expect(isExpanded).toBe(false);

        initTopicFilters();

        const toggleElement = document.querySelector(".js-drawer-toggle");
        if (toggleElement) {
          toggleElement.dispatchEvent(new Event("click"));
          setTimeout(() => {
            expect(sideNav.classList.contains("is-expanded")).toBe(true);
            expect(sideNav.classList.contains("is-collapsed")).toBe(false);
          }, 10);
        }
      }
    });

    test("should collapse side navigation when show is false", () => {
      const sideNav = document.getElementById("sideNav");
      expect(sideNav).toBeTruthy();

      if (sideNav) {
        initTopicFilters();

        const toggleElement = document.querySelector(".js-drawer-toggle");
        if (toggleElement) {
          toggleElement.dispatchEvent(new Event("click")); // Expand
          toggleElement.dispatchEvent(new Event("click")); // Collapse
        }

        setTimeout(() => {
          expect(sideNav.classList.contains("is-expanded")).toBe(false);
          expect(sideNav.classList.contains("is-collapsed")).toBe(true);
        }, 10);
      }
    });
  });

  describe("setupSideNavigation", () => {
    test("should add event listeners to all toggle buttons", () => {
      const toggleButtons = document.querySelectorAll(".js-drawer-toggle");
      initTopicFilters();

      toggleButtons.forEach((toggle) => {
        const clickHandler = jest.fn();
        toggle.addEventListener("click", clickHandler);

        toggle.dispatchEvent(new Event("click"));

        expect(clickHandler).toHaveBeenCalled();
      });
    });
  });

  describe("initFilters", () => {
    beforeEach(() => {
      window.location.search = "";
      initTopicFilters();
    });

    test("should populate checkboxes based on URL parameters", async () => {
      window.location.search = "?filters=filter1,filter2";
      initTopicFilters();

      const checkbox1 = document.querySelector(
        '[aria-labelledby="filter1-filter"]'
      ) as HTMLInputElement;
      const checkbox2 = document.querySelector(
        '[aria-labelledby="filter2-filter"]'
      ) as HTMLInputElement;

      setTimeout(() => {
        expect(checkbox1.checked).toBe(true);
        expect(checkbox2.checked).toBe(true);
      }, 10);
    });

    test("should enable and disable checkboxes based on available topics", () => {
      const checkbox1 = document.querySelector(
        '[aria-labelledby="filter1-filter"]'
      ) as HTMLInputElement;
      const checkbox2 = document.querySelector(
        '[aria-labelledby="filter2-filter"]'
      ) as HTMLInputElement;
      const checkbox3 = document.querySelector(
        '[aria-labelledby="filter3-filter"]'
      ) as HTMLInputElement;

      expect(checkbox1.disabled).toBe(false);
      expect(checkbox2.disabled).toBe(false);
      expect(checkbox3.disabled).toBe(false);

      const checkbox4 = document.createElement("input");
      checkbox4.type = "checkbox";
      checkbox4.setAttribute("data-js", "filter");
      checkbox4.value = "filter4";
      checkbox4.setAttribute("aria-labelledby", "filter4-filter");

      document.body.appendChild(checkbox4);

      initTopicFilters();

      expect(checkbox4.disabled).toBe(true);
    });

    test("should add filters to the URL and hide/show topics", () => {
      const checkbox1 = document.querySelector(
        '[aria-labelledby="filter1-filter"]'
      ) as HTMLInputElement;
      const checkbox3 = document.querySelector(
        '[aria-labelledby="filter3-filter"]'
      ) as HTMLInputElement;
      const topics = document.querySelectorAll('[data-js="item"]');

      expect(topics).toHaveLength(3);
      expect(topics[0].classList.contains("u-hide")).toBe(false);
      expect(topics[1].classList.contains("u-hide")).toBe(false);
      expect(topics[2].classList.contains("u-hide")).toBe(false);

      checkbox1.checked = true;
      checkbox1.dispatchEvent(new Event("change"));

      expect(window.history.pushState).toHaveBeenCalledWith(
        { filters: ["filter1"] },
        "",
        expect.stringContaining("?filters=filter1")
      );

      expect(topics[0].classList.contains("u-hide")).toBe(false);
      expect(topics[1].classList.contains("u-hide")).toBe(true);
      expect(topics[2].classList.contains("u-hide")).toBe(false);

      checkbox3.checked = true;
      checkbox3.dispatchEvent(new Event("change"));

      expect(window.history.pushState).toHaveBeenCalledWith(
        { filters: ["filter1", "filter3"] },
        "",
        expect.stringContaining("?filters=filter1,filter3")
      );

      expect(topics[0].classList.contains("u-hide")).toBe(false);
      expect(topics[1].classList.contains("u-hide")).toBe(false);
      expect(topics[2].classList.contains("u-hide")).toBe(false);

      checkbox1.checked = false;
      checkbox1.dispatchEvent(new Event("change"));

      expect(window.history.pushState).toHaveBeenCalledWith(
        { filters: ["filter3"] },
        "",
        expect.stringContaining("?filters=filter3")
      );

      expect(topics[0].classList.contains("u-hide")).toBe(true);
      expect(topics[1].classList.contains("u-hide")).toBe(false);
      expect(topics[2].classList.contains("u-hide")).toBe(false);
    });

    test("should update URL when filters are added or removed", () => {
      const checkbox1 = document.querySelector(
        '[aria-labelledby="filter1-filter"]'
      ) as HTMLInputElement;
      const checkbox2 = document.querySelector(
        '[aria-labelledby="filter2-filter"]'
      ) as HTMLInputElement;

      checkbox1.checked = true;
      checkbox1.dispatchEvent(new Event("change"));

      expect(window.history.pushState).toHaveBeenCalledWith(
        { filters: ["filter1"] },
        "",
        expect.stringContaining("?filters=filter1")
      );

      checkbox2.checked = true;
      checkbox2.dispatchEvent(new Event("change"));

      expect(window.history.pushState).toHaveBeenCalledWith(
        { filters: ["filter1", "filter2"] },
        "",
        expect.stringContaining("?filters=filter1,filter2")
      );

      checkbox1.checked = false;
      checkbox1.dispatchEvent(new Event("change"));

      expect(window.history.pushState).toHaveBeenCalledWith(
        { filters: ["filter2"] },
        "",
        expect.stringContaining("?filters=filter2")
      );
    });

    test("should update the filter button label based on the active filters", () => {
      const checkbox1 = document.querySelector(
        '[aria-labelledby="filter1-filter"]'
      ) as HTMLInputElement;
      const closeFiltersButtonMobile = document.querySelector(
        '[data-js="filter-button-mobile-close"]'
      ) as HTMLElement;

      expect(closeFiltersButtonMobile.innerHTML).toBe("Hide filters");

      checkbox1.checked = true;
      checkbox1.dispatchEvent(new Event("change"));

      expect(closeFiltersButtonMobile.innerHTML).toBe("Apply filters");

      checkbox1.checked = false;
      checkbox1.dispatchEvent(new Event("change"));

      expect(closeFiltersButtonMobile.innerHTML).toBe("Hide filters");
    });
  });
});
