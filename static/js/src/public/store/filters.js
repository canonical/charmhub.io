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
    const image = document.createElement("img");
    image.width = 24;
    image.height = 24;

    if (os === "kubernetes") {
      image.alt = "Kubernetes";
      image.src = "https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg";
    }

    if (os === "windows") {
      image.alt = "Windows";
      image.src = "https://assets.ubuntu.com/v1/ff17c4fe-Windows.svg";
    }

    if (os === "linux") {
      image.alt = "Linux";
      image.src = "https://assets.ubuntu.com/v1/dc11bd39-Linux.svg";
    }

    entityCardIcons.appendChild(image);
  });

  return clone;
}

function getCharmsList() {
  const entityContainer = document.getElementById("entity-container");

  fetch("/charms.json")
    .then((result) => result.json())
    .then((data) => {
      const charms = data.charms.filter((charm) => charm.type === "charm");

      if (!charms) {
        renderNoResultsMessage();
        return;
      }

      renderResultsCount(charms.length, charms.length);
      renderCharmCards(charms);
      handlePlatformChange(charms);

      const searchParams = new URLSearchParams(window.location.search);
      const platformQuery = searchParams.get("platform");

      if (platformQuery) {
        if (platformQuery === "all") {
          renderResultsCount(charms.length, charms.length);
          renderCharmCards(charms);
        } else {
          const platformResults = charms.filter((charm) =>
            charm.store_front.os.includes(platformQuery)
          );

          renderResultsCount(platformResults.length, charms.length);
          renderCharmCards(platformResults);
        }
      }
    })
    .catch((e) => console.log("error", e));
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
  const resultsCount = document.getElementById("results-count");
  const clone = resultsCount.content.cloneNode(true);

  const totalResults = clone.querySelector(".total-results");
  totalResults.innerText = results;

  const totalCharms = clone.querySelector(".total-charms");
  totalCharms.innerText = charms;

  resultsCountContainer.innerHTML = "";
  resultsCountContainer.appendChild(clone);
}

function handlePlatformChange(charms) {
  const platformSwitcher = document.getElementById("platform-handler");

  platformSwitcher.addEventListener("change", (e) => {
    const platform = e.target.value;

    const platformCharms = charms.filter((charm) =>
      charm.store_front.os.includes(platform)
    );

    if (platform === "all") {
      renderResultsCount(charms.length, charms.length);
      renderCharmCards(charms);
    } else {
      renderResultsCount(platformCharms.length, charms.length);
      renderCharmCards(platformCharms);
    }

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("platform", platform);
    window.location.search = searchParams;
  });
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
