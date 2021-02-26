import { truncateString } from "../../libs/truncate-string";

function buildPackageCard(entity) {
  const entityCard = document.getElementById("package-card");
  const clone = entityCard.content.cloneNode(true);

  const entityCardContainer = clone.querySelector(".l-flex__card");
  entityCardContainer.id = entity.name;

  const entityCardButton = clone.querySelector(".p-card--button");
  entityCardButton.href = `/${entity.name}`;

  const charmCardThumbnailContainer = clone.querySelector(
    ".p-card__thumbnail-container"
  );
  const bundleCardThumbnailContainer = clone.querySelector(".p-bundle-icons");

  if (entity.type === "charm") {
    bundleCardThumbnailContainer.remove();
    const charmThumbnail = charmCardThumbnailContainer.querySelector(
      ".p-card__thumbnail"
    );
    charmThumbnail.alt = entity.name;
    charmThumbnail.setAttribute("loading", "lazy");

    if (entity.store_front.icons && entity.store_front.icons[0]) {
      charmThumbnail.src =
        "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_64,h_64/" +
        entity.store_front.icons[0];
    } else {
      charmThumbnail.src =
        "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_64,h_64/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
    }
  } else {
    charmCardThumbnailContainer.remove();
    const bundleThumbnails = bundleCardThumbnailContainer.querySelectorAll(
      "img"
    );
    const bundleIconsCount = bundleCardThumbnailContainer.querySelector(
      ".p-bundle-icons__count"
    );

    bundleIconsCount.innerText = `+${Math.floor(Math.random() * 10 + 1)}`;

    bundleThumbnails.forEach((thumbnail) => {
      thumbnail.src =
        "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_64,h_64/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
    });
  }

  const entityCardTitle = clone.querySelector(".package-card-title");
  entityCardTitle.innerText = entity.name.replace(/-/g, " ");

  const entityCardPublisher = clone.querySelector(".package-card-publisher");
  entityCardPublisher.innerText = entity.result.publisher["display-name"];

  const entityCardSummary = clone.querySelector(".package-card-summary");

  if (entity.result.summary) {
    entityCardSummary.innerHTML = truncateString(
      entity.result.summary,
      90,
      "&hellip;"
    );
  }

  const entityCardIcons = clone.querySelector(".package-card-icons");

  entity.store_front.os.forEach((os) => {
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

export default buildPackageCard;
