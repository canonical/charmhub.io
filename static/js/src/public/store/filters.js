import buildCharmCard from "./buildCharmCard";

function getCharmsList() {
  fetch("/charms.json")
    .then((result) => result.json())
    .then((data) => {
      const charms = data.charms.filter((charm) => charm.type === "charm");

      if (!charms) {
        renderNoResultsMessage();
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const platformQuery = searchParams.get("platform");
      const categoriesQuery = searchParams.get("categories");

      toggleShowAllOperatorsButton(platformQuery);
      handleShowAllOperators(charms);
      handlePlatformChange(charms);
      handleCategoryFilters(charms);
      enableAllActions();
    })
    .catch((e) => console.log("error", e));
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

function getFeatureCount() {
  const featuredContainer = document.getElementById("features-container");
  const featuredCards = featuredContainer.querySelectorAll(".p-layout__card");
  return featuredCards.length;
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

    hideFeatured();

    toggleShowAllOperatorsButton(platform);
  });
}

function setQueryStringParameter(name, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState(
    {},
    "",
    decodeURIComponent(`${window.location.pathname}?${params}`)
  );
}

function showFeatured() {
  const featuredContainer = document.getElementById("features-container");
  const entityContainer = document.getElementById("entity-container");

  featuredContainer.classList.remove("u-hide");
  entityContainer.classList.add("u-hide");
}

function hideFeatured() {
  const featuredContainer = document.getElementById("features-container");
  const entityContainer = document.getElementById("entity-container");

  featuredContainer.classList.add("u-hide");
  entityContainer.classList.remove("u-hide");
}

function renderNoResultsMessage() {
  if (!"content" in document.createElement("template")) {
    return;
  }

  const entityContainer = document.getElementById("entity-container");
  const noResultsMessage = document.getElementById("no-results-message");
  const clone = noResultsMessage.content.cloneNode(true);

  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get("q");

  if (searchParams) {
    const searchQueryMessage = clone.querySelector(".search-query");
    searchQueryMessage.innerHTML = ` "<strong>${searchQuery}</strong>"`;
  }

  entityContainer.innerHTML = "";
  entityContainer.appendChild(clone);
}

function handleShowAllOperators(charms) {
  const showAllOperatorsButton = document.getElementById("more-operators");
  showAllOperatorsButton.addEventListener("click", (e) => {
    e.preventDefault();
    hideFeatured();
    renderResultsCount(charms.length, charms.length);
    renderCharmCards(charms);
    toggleShowAllOperatorsButton("all");
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

function toggleShowAllOperatorsButton(platformQuery) {
  const allOperatorsButton = document.getElementById("more-operators");

  if (platformQuery === "all") {
    allOperatorsButton.classList.add("u-hide");
  } else {
    allOperatorsButton.classList.remove("u-hide");
  }
}

function handleCategoryFilters(charms) {
  const categoryFilters = document.querySelectorAll(".category-filter");

  categoryFilters.forEach((categoryFilter) => {
    categoryFilter.addEventListener("click", (e) => {
      const category = e.target.value;
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
      hideFeatured();

      if (categories.length || platform != "all") {
        renderResultsCount(filteredCharms.length, charms.length);
        renderCharmCards(filteredCharms);
      } else {
        renderResultsCount(charms.length, charms.length);
        renderCharmCards(charms);
      }

      console.log(categories.length, platform);
      if (!categories.length && platform == "all") {
        console.log("show featured");
        showFeatured();
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

function selectFilters(categories) {
  const categoryFilters = document.querySelectorAll(".category-filter");

  categoryFilters.forEach((filter) => {
    if (categories.includes(filter.value)) {
      filter.checked = true;
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
  const allOperatorsButton = document.getElementById("more-operators");

  platformSwitch.disabled = false;
  allOperatorsButton.disabled = false;
  categoryFilters.forEach((categoryFilter) => {
    categoryFilter.disabled = false;
  });
}

export { getCharmsList };
