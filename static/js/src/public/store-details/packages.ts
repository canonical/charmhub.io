import buildPackageCard from "./buildPackageCard";
import debounce from "../../libs/debounce";

type Entity = {
  type: string;
  name: string;
  store_front: {
    icons: string[];
    "display-name": string;
    "deployable-on": string[];
    categories: { slug: string }[];
  };
  result: {
    publisher: { "display-name": string };
    summary: string;
  };
  apps: { name: string; title: string }[];
};

/** Store page filters */
class initPackages {
  allPackages: any[];
  searchCache: string;
  _filters: { [key: string]: any };
  domEl: any;
  filteredPackagesAllCategories: any;
  packages: any;

  static async initialize() {
    const packageData = await initPackages.fetchPackageList();

    const allPackages = await initPackages.addBundleApps(packageData.packages);
  }

  static getUrlFilters() {
    const filters: { [key: string]: any } = {};

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

  static async fetchPackageList() {
    const filters = initPackages.getUrlFilters();
    if (filters.q.length > 0) {
      const queryUrl = filters.q.join(",");
      const result = await fetch(`/packages.json?q=${queryUrl}`);
      return await result.json();
    } else {
      const result = await fetch("/packages.json");
      return await result.json();
    }
  }

  static async getBundleApps(bundleName: string) {
    const response = await fetch(`/${bundleName}/charms.json`);

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("There was a problem communicating with the server.");
    }
  }

  static async addBundleApps(packages: any[]) {
    return Promise.all(
      packages.map(async (entity: Entity) => {
        if (entity.type === "bundle") {
          const charms = await initPackages.getBundleApps(entity.name);
          entity.apps = charms.charms;
        }
        return entity;
      })
    );
  }

  constructor(packages: any[]) {
    this.allPackages = packages;
    this.selectElements();
    this.togglePlaceholderContainer(true);
    this.searchCache = window.location.search;
    this._filters = initPackages.getUrlFilters();

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
      handleBundleIcons(this.domEl.packageContainer.el);
    }

    this.captureTooltipButtonClick();
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
      this.domEl.showAllPackagesButton.el.addEventListener("click", (e: Event) => {
        e.preventDefault();
        this.togglePackageContainer(true);
        this.renderPackages();
        this.renderResultsCount();
        this.renderButtonMobileOpen();
        this.toggleFeaturedContainer();
        this.toggleShowAllPackagesButton();
        handleBundleIcons(this.domEl.packageContainer.el);
        window.scrollTo(0, 0);
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.showAllPackagesButton.selector} selector.`
      );
    }
  }

  renderResultsCount(featured: boolean = false) {
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
        '',
        decodeURIComponent(newUrl)
      );
    }
  }

  handlePlatformChange() {
    if (this.domEl.baseSwitcher.el) {
      this.domEl.baseSwitcher.el.addEventListener("change", (e: Event) => {
        this._filters.base[0] = (e.target as HTMLInputElement).value;

        this.filterPackages();
        this.updateEnabledCategories();
        this.renderPackages();
        this.renderResultsCount();
        this.renderButtonMobileOpen();
        this.updateHistory();
        this.toggleFeaturedContainer();
        this.toggleShowAllPackagesButton();
        this.togglePackageContainer(true);
        handleBundleIcons(this.domEl.packageContainer.el);
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.baseSwitcher.selector} selector.`
      );
    }
  }

  handlePackageTypeChange() {
    if (this.domEl.packageTypeSwitcher.el) {
      this.domEl.packageTypeSwitcher.el.addEventListener("change", (e: Event) => {
        this._filters.type[0] = (e.target as HTMLInputElement).value;

        this.filterPackages();
        this.updateEnabledCategories();
        this.renderPackages();
        this.renderResultsCount();
        this.renderButtonMobileOpen();
        this.updateHistory();
        this.toggleFeaturedContainer();
        this.toggleShowAllPackagesButton();
        this.togglePackageContainer(true);
        handleBundleIcons(this.domEl.packageContainer.el);
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.packageTypeSwitcher.selector} selector.`
      );
    }
  }

  handleFilterClick() {
    if (this.domEl.categoryFilters.el) {
      this.domEl.categoryFilters.el.forEach((categoryFilter: HTMLInputElement) => {
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
              (el: string) => el !== categoryFilter.value
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
          handleBundleIcons(this.domEl.packageContainer.el);
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
    this.domEl.categoryFilters.el.forEach((filter: { disabled: boolean; }) => {
      filter.disabled = false;
    });

    // If the user is searching or using filters
    if (
      this._filters.q.length > 0 ||
      this._filters.base[0] !== "all" ||
      this._filters.type[0] !== "all"
    ) {
      const categories: any[] = [];

      this.filteredPackagesAllCategories.forEach((entity: Entity) => {
        if (entity.store_front.categories) {
          entity.store_front.categories.forEach((cat) => {
            if (!categories.includes(cat.slug)) {
              categories.push(cat.slug);
            }
          });
        }
      });

      // We hide categories without results
      this.domEl.categoryFilters.el.forEach((filter: { value: any; disabled: boolean; }) => {
        if (categories.includes(filter.value)) {
          filter.disabled = false;
        } else {
          filter.disabled = true;
        }
      });
    }
  }

  togglePlaceholderContainer(visibility: boolean = false) {
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

  togglePackageContainer(visibility: boolean = false) {
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

  toggleFeaturedContainer(visibility: boolean = false) {
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
      this.packages = this.packages.filter((entity: Entity) =>
        entity.store_front["deployable-on"].includes(this._filters.base[0])
      );
    }

    if (this._filters.type[0] !== "all") {
      this.packages = this.packages.filter((entity: Entity) =>
        entity["type"].includes(this._filters.type[0])
      );
    }

    this.filteredPackagesAllCategories = this.packages;

    if (this._filters.filter.length > 0) {
      this.packages = this.packages.filter((entity: Entity) =>
        this.filterByCategory(entity)
      );
    }
  }

  filterByCategory(entity: Entity) {
    let packageCategories: string[] = [];

    if (entity.store_front.categories) {
      packageCategories = entity.store_front.categories.map((cat) => {
        return cat.slug;
      });
    } else {
      return null;
    }

    const cats = this._filters.filter.filter((cat: string) => {
      if (packageCategories.includes(cat)) {
        return cat;
      } else {
        return null;
      }
    });

    if (cats.length) {
      return entity;
    } else {
      return null;
    }
  }

  renderPackages() {
    if (!("content" in document.createElement("template"))) {
      return;
    }

    if (this.domEl.packageContainer.el) {
      this.domEl.packageContainer.el.innerHTML = "";

      this.packages.forEach((entity: Entity) => {
        this.domEl.packageContainer.el.appendChild(buildPackageCard(entity));
      });

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

  toggleShowAllPackagesButton(visibility: boolean = false) {
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
      const filterSpanEl =
        this.domEl.filterButtonMobileOpen.el.querySelector("span");
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

/**
 * Bundles have multiple icons, sometimes those icons don't fit
 * in the container. This function hides icons that don't fit and
 * adds a count of "missing" icons.
 */
function handleBundleIcons(container: HTMLElement) {
  const contents = container.querySelectorAll(".p-card__content");

  const ensureBundleCharmsFit = () => {
    // For each contents
    contents.forEach((content) => {
      // Get the height of the visible area
      const clientHeight = content.clientHeight;

      // Get all the icons
      const icons: HTMLElement[] = Array.from(content.querySelectorAll(".p-bundle-icon"));

      // If there aren't any icons, skip to the next content area
      if (!icons[0]) {
        return;
      }

      // What's the height of an icon? They're all the same
      // so just use the first one.
      const iconHeight = icons[0].offsetHeight;

      // Keep track of how many icons we've hidden
      let hiddenIcons = 0;

      icons.forEach((icon) => {
        // First of all make sure the icon is visible
        // If an icon has previously been hidden we won't be able
        // to get it's offset (it'll be 0).
        icon.classList.remove("u-hide");

        // Once it's visible, get the offset
        // Doing it like this isn't very performant but should be fine.
        const offsetTop = icon.offsetTop;

        // If the bottom of the icon is below the bottom of the visible area
        if (offsetTop + iconHeight > clientHeight) {
          // Add the icon as hidden and add the class
          hiddenIcons += 1;
          icon.classList.add("u-hide");
        }
      });

      // If there are hidden icons, and there is a final icon
      if (hiddenIcons > 0 && icons.length - hiddenIcons - 1 > 0) {
        // Get the last visible icon, hide it and update the hiddenIcons count.
        icons[icons.length - hiddenIcons - 1].classList.add("u-hide");
        hiddenIcons += 1;
      }

      // Get the extra count container
      let hiddenCount = content.querySelector(".p-bundle-icons__count");
      if (hiddenIcons > 0) {
        // If the container doesn't work, create it
        if (!hiddenCount) {
          hiddenCount = document.createElement("span");
          hiddenCount.setAttribute(
            "class",
            "p-bundle-icons__count u-text--muted"
          );

          // Add the element if the parent node exists
          if (icons[0].parentNode) {
            icons[0].parentNode.appendChild(hiddenCount);
          }
        }

        // Set the count of missing icons
        hiddenCount.innerHTML = `+${hiddenIcons}`;
      } else {
        // If there aren't any missing icons, remove the container
        if (hiddenCount && hiddenCount.parentNode) {
          hiddenCount.parentNode.removeChild(hiddenCount);
        }
      }
    });
  };

  // If there are content areas
  if (contents.length > 0) {
    // Initialize all the icons
    ensureBundleCharmsFit();

    // We don't need to do this on every single window resize event, just every so often.
    const debounced = debounce(ensureBundleCharmsFit, 50, false);

    // Remove the resize listener (to avoid duplicate events on subsequent runs)
    window.removeEventListener("resize", debounced);

    // Add it again
    window.addEventListener("resize", debounced);
  }
}

function loadBundleIcons() {
  const bundleIcons = document.querySelectorAll(".p-bundle-icon") as NodeListOf<HTMLElement>;
  if (bundleIcons.length > 0) {
    bundleIcons.forEach((bundleIcon) => {
      const title = bundleIcon.getAttribute("title") || "";
      const initials = bundleIcon.innerHTML;
      const name = bundleIcon.getAttribute("alt") || "";

      const icon = new Image();
      icon.alt = name;
      icon.title = title;
      icon.setAttribute("loading", "lazy");
      icon.addEventListener("error", () => {
        bundleIcon.removeChild(icon);
        bundleIcon.innerText = initials;
        bundleIcon.style.backgroundImage = `url("https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg")`;
      });
      bundleIcon.innerHTML = "";
      bundleIcon.style.backgroundImage = "none";
      icon.src = `/${name}/icon-no-default`;

      bundleIcon.appendChild(icon);
    });
  }
}

export { initPackages, handleBundleIcons, loadBundleIcons };
