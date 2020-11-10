import { Filters } from "./filters";

describe("Filters", () => {
  describe("getSelectedFiltersCount()", () => {
    let filterElements;

    beforeEach(() => {
      filterElements = document.createElement("div");
      filterElements.innerHTML = `
        <div class="p-filter" data-js="filter-handler">
          <div class="p-filter__title" data-filters="applied-filters">Filters</div>
          <form>
            <div class="p-filter__scroll-box">
              <ul class="p-filter__list">
                <li class="p-filter__item--title">
                  Categories
                </li>
                <li class="p-filter__item" data-filter-type="category" data-js="filter" data-filter-value="featured">
                  <input type="checkbox" id="featured" value="featured">
                  <label for="featured">Featured</label>
                </li>
                <li class="p-filter__item" data-filter-type="category" data-js="filter" data-filter-value="analytics">
                  <input type="checkbox" id="analytics" value="analytics">
                  <label for="analytics">Analytics</label>
                </li>
                <li class="p-filter__item" data-filter-type="category" data-js="filter" data-filter-value="security">
                  <input type="checkbox" id="security" value="security">
                  <label for="security">Security</label>
                </li>
              </ul>
            </div>
          </form>
        </div>

        <form class="p-search-box p-store__search" data-js="search-handler">
          <input type="search" class="p-search-box__input" name="q" placeholder="Search">
          <button type="submit" class="p-search-box__button" alt="Search"><i class="p-icon--search"></i></button>
        </form>

        <select name="sort" data-js="sort-handler" value="" class="p-store__sort-desktop">
          <option disabled="disabled" value="">Sort by</option>
          <option value="name-desc">Name A/Z</option>
          <option value="name-asc">Name Z/A</option>
        </select>

        <div class="p-store__sort-mobile">
          <a href="/store" data-js="mobile-sort-reveal-button" class="has-icon p-store__button"><i class="p-icon--sort"></i>Sort by</a>
          <a href="/store" data-js="mobile-filter-reveal-button" class="has-icon p-store__button"><i class="p-icon--filter"></i>Filters</a>
        </div>

        <a href="?category=all" class="p-button--positive u-hide" id="more-operators">See more operators</a>
        `;

      document.body.appendChild(filterElements);
    });

    afterEach(() => {
      document.body.removeChild(filterElements);
    });

    it("should return 1 if no filters are selected (featured selected by default)", () => {
      const testFilters = new Filters({
        filter: "[data-js='filter-handler']",
        search: "[data-js='search-handler']",
        sort: "[data-js='sort-handler']",
        sortMobile: "[data-js='mobile-sort-handler']",
        sortMobileButton: "[data-js='mobile-sort-reveal-button']",
        filterMobileButton: "[data-js='mobile-filter-reveal-button']",
      });

      expect(testFilters.getSelectedFiltersCount()).toEqual(1);
    });

    it("should return 2 if two filter are selected", () => {
      const testFilters = new Filters({
        filter: "[data-js='filter-handler']",
        search: "[data-js='search-handler']",
        sort: "[data-js='sort-handler']",
        sortMobile: "[data-js='mobile-sort-handler']",
        sortMobileButton: "[data-js='mobile-sort-reveal-button']",
        filterMobileButton: "[data-js='mobile-filter-reveal-button']",
      });

      const filterListEl = document.querySelectorAll("[data-js='filter']");

      filterListEl.forEach((el) => {
        el.click();
      });
      expect(testFilters.getSelectedFiltersCount()).toEqual(2);
    });
  });
});
