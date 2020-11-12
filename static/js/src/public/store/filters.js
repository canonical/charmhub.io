function buildCharmCard(charm) {
  const entityCard = document.getElementById("entity-card");
  const clone = entityCard.content.cloneNode(true);

  const entityCardContainer = clone.querySelector(".p-layout__card");
  entityCardContainer.id = charm.name;

  const entityCardButton = clone.querySelector(".p-card--button");
  entityCardButton.href = `/${charm.name}`;

  const entityCardThumbnail = clone.querySelector(".p-card__thumbnail");
  entityCardThumbnail.alt = charm.name;

  if (charm.store_front.icons) {
    entityCardThumbnail.src = charm.store_front.icons[0];
  } else {
    entityCardThumbnail.src =
      "https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
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
    span.class = "p-tooltip";
    span.setAttribute('aria-describedby', 'default-tooltip')
    image.width = 24;
    image.height = 24;
    tooltip.class = "p-tooltip__message";
    tooltip.role = "tooltip";

    if (os === "kubernetes") {
      image.alt = "Kubernetes";
      image.src = "https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg";
      tooltip.innerText = "This operator drives the application on Kubernetes"
    }

    if (os === "windows") {
      image.alt = "Windows";
      image.src = "https://assets.ubuntu.com/v1/ff17c4fe-Windows.svg";
      tooltip.innerText = "This operator drives the application on Windows servers"
    }

    if (os === "linux") {
      image.alt = "Linux";
      image.src = "https://assets.ubuntu.com/v1/dc11bd39-Linux.svg";
      tooltip.innerText = "This operator drives the application on Linux servers"
    }

    span.appendChild(image)
    span.appendChild(tooltip)
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

      if (platformQuery) {
        hideFeatured();
      }

      if (!platformQuery || platformQuery === "all") {
        renderResultsCount(charms.length, charms.length);
        renderCharmCards(charms);
      } else {
        const platformResults = filterCharmsByPlatform(charms, platformQuery);

        renderResultsCount(platformResults.length, charms.length);
        renderCharmCards(platformResults);
      }

      handlePlatformChange(charms);
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

  const resultsCountContainer = document.getElementById(
    "results-count-container"
  );

  if (!platformQuery) {
    resultsCountContainer.innerHTML = `${getFeatureCount()} featured of ${charms}`;
  } else if (platformQuery == "all") {
    resultsCountContainer.innerHTML = `Showing all ${charms}`;
  } else {
    resultsCountContainer.innerHTML = `${results} of ${charms}`;
  }
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
    setQueryStringParameter("platform", platform);

    if (platform === "all") {
      renderResultsCount(charms.length, charms.length);
      renderCharmCards(charms);
    } else {
      const platformCharms = filterCharmsByPlatform(charms, platform);
      renderResultsCount(platformCharms.length, charms.length);
      renderCharmCards(platformCharms);
    }
    hideFeatured();
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

export { getCharmsList };
