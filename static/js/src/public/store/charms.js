import buildCharmCard from "./buildCharmCard";

function initCharms() {
  getCharmsList()
    .then((data) => {
      const charms = data.charms.filter((charm) => charm.type === "charm");

      if (!charms) {
        return;
      }

      handleShowAllCharmsButton(charms);
      handlePlatformChange(charms);
      handleCategoryFilters(charms);
      enableAllActions();
    })
    .catch((e) => console.error(e));
}

function getCharmsList() {
  return fetch("/charms.json").then((result) => result.json());
}

function filterCharmsByPlatform(charmSet, platform) {
  return charmSet.filter((charm) => charm.store_front.os.includes(platform));
}

function renderCharmCards(charms) {
  if (!"content" in document.createElement("template")) {
    return;
  }

  const entityContainer = document.getElementById("entity-container");
  entityContainer.innerHTML = "";

  charms.forEach((charm) => {
    entityContainer.appendChild(buildCharmCard(charm));
  });
}

function renderResultsCount(results, charms) {
  if (!"content" in document.createElement("template")) {
    return;
  }

  const resultsCountContainer = document.getElementById(
    "results-count-container"
  );

  resultsCountContainer.innerHTML = `${results} of ${charms}`;
}

function handlePlatformChange(charms) {
  const platformSwitcher = document.getElementById("platform-handler");

  platformSwitcher.addEventListener("change", (e) => {
    const platform = e.target.value;

    if (platform === "all") {
      renderResultsCount(charms.length, charms.length);
      renderCharmCards(charms);
      enableFilters();
    } else {
      const platformCharms = filterCharmsByPlatform(charms, platform);
      renderResultsCount(platformCharms.length, charms.length);
      renderCharmCards(platformCharms);
      disableFiltersByPlatform(platformCharms);
    }

    const categoryFilters = document.querySelectorAll(".category-filter");

    categoryFilters.forEach((filter) => {
      filter.checked = false;
    });

    hideFeaturedCharms();

    toggleShowAllCharmsButton(platform);
  });
}

function showFeaturedCharms() {
  const featuredContainer = document.getElementById("features-container");
  const entityContainer = document.getElementById("entity-container");

  featuredContainer.classList.remove("u-hide");
  entityContainer.classList.add("u-hide");
}

function hideFeaturedCharms() {
  const featuredContainer = document.getElementById("features-container");
  const entityContainer = document.getElementById("entity-container");

  featuredContainer.classList.add("u-hide");
  entityContainer.classList.remove("u-hide");
}

function handleShowAllCharmsButton(charms) {
  const showAllCharmsButton = document.getElementById("show-all-charms");
  showAllCharmsButton.addEventListener("click", (e) => {
    e.preventDefault();
    hideFeaturedCharms();
    renderResultsCount(charms.length, charms.length);
    renderCharmCards(charms);
    toggleShowAllCharmsButton("all");
    const categoryFilters = document.querySelectorAll(".category-filter");
    const platformSwitcher = document.getElementById("platform-handler");
    categoryFilters.forEach((filter) => {
      filter.checked = false;
      filter.disabled = false;
    });
    platformSwitcher.value = "all";

    window.scrollTo(0, 0);
  });
}

function toggleShowAllCharmsButton(platform) {
  const showAllCharmsButton = document.getElementById("show-all-charms");

  if (platform === "all") {
    showAllCharmsButton.classList.add("u-hide");
  } else {
    showAllCharmsButton.classList.remove("u-hide");
  }
}

function handleCategoryFilters(charms) {
  const categoryFilters = document.querySelectorAll(".category-filter");

  categoryFilters.forEach((categoryFilter) => {
    categoryFilter.addEventListener("click", () => {
      let categories = [];

      const categoryFilters = document.querySelectorAll(".category-filter");
      categoryFilters.forEach((categoryFilter) => {
        if (categoryFilter.checked) {
          categories.push(categoryFilter.value);
        }
      });

      const platform = document.getElementById("platform-handler").value;

      let filteredCharms = filterCharmsByCategories(charms, categories);
      if (platform !== "all") {
        filteredCharms = filterCharmsByPlatform(filteredCharms, platform);
      }
      hideFeaturedCharms();

      if (categories.length || platform != "all") {
        renderResultsCount(filteredCharms.length, charms.length);
        renderCharmCards(filteredCharms);
      } else {
        renderResultsCount(charms.length, charms.length);
        renderCharmCards(charms);
      }

      if (!categories.length && platform == "all") {
        showFeaturedCharms();
      }
    });
  });
}

function filterCharmsByCategories(charms, categoriesQuery) {
  if (!categoriesQuery || categoriesQuery === "all") {
    return charms;
  }

  if (categoriesQuery !== typeof "string" && categoriesQuery.includes("all")) {
    categoriesQuery = categoriesQuery.filter((cat) => cat !== "all");
  }

  if (!categoriesQuery.length) {
    return charms;
  }

  return charms.filter((charm) => {
    let charmCategories = [];

    if (charm.store_front.categories) {
      charmCategories = charm.store_front.categories.map((cat) => {
        return cat.slug;
      });
    }

    const cats = categoriesQuery.filter((cat) => {
      if (charmCategories.includes(cat)) {
        return cat;
      }
    });

    if (cats.length) {
      return charm;
    }
  });
}

function enableFilters() {
  const categoryFilters = document.querySelectorAll(".category-filter");

  categoryFilters.forEach((filter) => {
    filter.disabled = false;
  });
}

function disableFiltersByPlatform(charms) {
  const categoryFilters = document.querySelectorAll(".category-filter");
  const platformCategories = [];

  charms.forEach((charm) => {
    if (charm.store_front.categories) {
      charm.store_front.categories.forEach((cat) => {
        if (!platformCategories.includes(cat.slug)) {
          platformCategories.push(cat.slug);
        }
      });
    }
  });

  categoryFilters.forEach((filter) => {
    if (platformCategories.includes(filter.value)) {
      filter.disabled = false;
    } else {
      filter.disabled = true;
    }
  });
}

function enableAllActions() {
  const platformSwitch = document.getElementById("platform-handler");
  const categoryFilters = document.querySelectorAll(".category-filter");
  const allOperatorsButton = document.getElementById("show-all-charms");

  platformSwitch.disabled = false;
  allOperatorsButton.disabled = false;
  categoryFilters.forEach((categoryFilter) => {
    categoryFilter.disabled = false;
  });
}

export default initCharms;
