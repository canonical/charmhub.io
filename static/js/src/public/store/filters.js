function buildCharmCard(charm) {
  const entityCard = document.getElementById("entity-card");
  const clone = entityCard.content.cloneNode(true);

  const entityCardContainer = clone.querySelector(".p-layout__card");
  entityCardContainer.id = charm.name;

  const entityCardButton = clone.querySelector(".p-card--button");
  entityCardButton.href = `/${charm.name}`;

  const entityCardThumbnail = clone.querySelector(".p-card__thumbnail");
  entityCardThumbnail.alt = charm.name;
  entityCardThumbnail.setAttribute("loading", "lazy");

  if (charm.store_front.icons && charm.store_front.icons[0]) {
    entityCardThumbnail.src =
      "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_64,h_64/" +
      charm.store_front.icons[0];
  } else {
    entityCardThumbnail.src =
      "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_64,h_64/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
  }

  const entityCardTitle = clone.querySelector(".entity-card-title");
  entityCardTitle.innerText = charm.name.replace(/-/g, " ");

  const entityCardPublisher = clone.querySelector(".entity-card-publisher");
  entityCardPublisher.innerText = charm.result.publisher["display-name"];

  const entityCardSummary = clone.querySelector(".entity-card-summary");

  if (charm.result.summary) {
    entityCardSummary.innerText = charm.result.summary.substring(0, 90);
  }

  const entityCardIcons = clone.querySelector(".entity-card-icons");

  charm.store_front.os.forEach((os) => {
    const span = document.createElement("span");
    const image = document.createElement("img");
    const tooltip = document.createElement("span");
    span.setAttribute("class", "p-tooltip");
    span.setAttribute("aria-describedby", "default-tooltip");
    image.width = 24;
    image.height = 24;
    tooltip.setAttribute("class", "p-tooltip__message");
    tooltip.setAttribute("role", "tooltip");

    if (os === "kubernetes") {
      image.alt = "Kubernetes";
      image.src = "https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg";
      tooltip.innerText = "This operator drives the application on Kubernetes";
    }

    if (os === "windows") {
      image.alt = "Windows";
      image.src = "https://assets.ubuntu.com/v1/ff17c4fe-Windows.svg";
      tooltip.innerText =
        "This operator drives the application on Windows servers";
    }

    if (os === "linux") {
      image.alt = "Linux";
      image.src = "https://assets.ubuntu.com/v1/dc11bd39-Linux.svg";
      tooltip.innerText =
        "This operator drives the application on Linux servers";
    }

    span.appendChild(image);
    span.appendChild(tooltip);
    entityCardIcons.appendChild(span);
  });

  return clone;
}

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

      // if (platformQuery || categoriesQuery) {
      //   hideFeatured();
      // }

      // let platformResults = charms;

      // if (platformQuery) {
      //   platformResults = filterCharmsByPlatform(charms, platformQuery);
      // }

      // if (platformQuery === "all") {
      //   platformResults = charms;
      // }

      // let categories = [];

      // if (categoriesQuery) {
      //   if (categoriesQuery.includes(",")) {
      //     categories = categoriesQuery.split(",");
      //   } else {
      //     categories = [categoriesQuery];
      //   }
      // }

      // let allResults = filterCharmsByCategories(platformResults, categories);

      // if (categoriesQuery === "all") {
      //   allResults = platformResults;
      // }

      // disableFiltersByPlatform(filterCharmsByPlatform(charms, platformQuery));
      // renderResultsCount(allResults.length, charms.length);
      // renderCharmCards(allResults);

      // selectFilters(categories);
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

  const searchParams = new URLSearchParams(window.location.search);
  const platformQuery = searchParams.get("platform");
  const categoryQuery = searchParams.get("categories");

  const resultsCountContainer = document.getElementById(
    "results-count-container"
  );

  // if (!platformQuery && !categoryQuery) {
  //   resultsCountContainer.innerHTML = `${getFeatureCount()} featured of ${charms}`;
  // } else if (results === charms) {
  //   resultsCountContainer.innerHTML = `Showing all ${charms}`;
  // } else {
  // }
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
    // setQueryStringParameter("platform", platform);

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
    // setQueryStringParameter("platform", "all");
    renderResultsCount(charms.length, charms.length);
    renderCharmCards(charms);
    toggleShowAllOperatorsButton("all");
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

      const searchParams = new URLSearchParams(window.location.search);
      const searchQuery = searchParams.get("categories");

      let categories = [];

      if (searchQuery) {
        categories = searchQuery.split(",");
      }

      if (categories.includes("all")) {
        categories = categories.filter((cat) => cat !== "all");
      }

      if (!categories.includes(category)) {
        categories.push(category);
      } else {
        categories = categories.filter((cat) => cat !== category);
      }

      // setQueryStringParameter("categories", categories);

      const filteredCharms = filterCharmsByCategories(charms, categories);

      hideFeatured();

      renderResultsCount(filteredCharms.length, charms.length);
      renderCharmCards(filteredCharms);

      if (!categories.length) {
        showFeatured();
      }

      window.scrollTo(0, 0);
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

export { getCharmsList };
