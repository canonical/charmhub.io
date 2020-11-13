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

export default buildCharmCard;
