import { truncateString } from "../../libs/truncate-string";

function buildPlatformIcons(entityCardIcons, altText, srcText, text) {
  const span = document.createElement("span");
  const image = document.createElement("img");
  const tooltip = document.createElement("span");
  span.setAttribute("class", "p-tooltip");
  span.setAttribute("aria-describedby", "default-tooltip");
  image.width = 24;
  image.height = 24;
  tooltip.setAttribute("class", "p-tooltip__message");
  tooltip.setAttribute("role", "tooltip");

  image.alt = altText;
  image.src = srcText;
  tooltip.innerText = text;

  span.appendChild(image);
  span.appendChild(tooltip);
  entityCardIcons.appendChild(span);
}

function buildPackageCard(entity) {
  const entityCard = document.getElementById(`package-card-${entity.type}`);
  const clone = entityCard.content.cloneNode(true);

  const entityCardContainer = clone.querySelector("[data-js='card-container']");
  entityCardContainer.id = entity.name;

  const entityCardButton = clone.querySelector(".p-card--button");
  entityCardButton.href = `/${entity.name}`;

  const iconContainer = clone.querySelector(".p-card__thumbnail-container");

  if (entity.type === "charm") {
    const charmIcon = iconContainer.querySelector(".p-card__thumbnail");
    charmIcon.alt = entity.name;
    charmIcon.setAttribute("loading", "lazy");

    if (entity.store_front.icons && entity.store_front.icons[0]) {
      charmIcon.src =
        "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/" +
        entity.store_front.icons[0];
    } else {
      charmIcon.src =
        "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
    }
  } else {
    const bundleIconsWrapper = clone.querySelector(".p-bundle-icons");
    const bundleIcons = bundleIconsWrapper.querySelector("img");
    const bundleIconsCount = bundleIconsWrapper.querySelector(
      ".p-bundle-icons__count"
    );

    if (!entity.apps || entity.apps.length === 0) {
      const icon = document.createElement("span");
      icon.setAttribute("class", "p-bundle-icon");
      icon.style.backgroundImage =
        "url(https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg)";
      bundleIcons.replaceWith(icon);
    } else {
      const icons = [];
      entity.apps.forEach((app) => {
        const iconWrapper = document.createElement("span");
        iconWrapper.title = app.title;
        iconWrapper.setAttribute("class", "p-bundle-icon");

        const icon = new Image();
        icon.alt = app.name;
        icon.title = app.title;
        icon.setAttribute("loading", "lazy");
        icon.addEventListener("error", () => {
          iconWrapper.removeChild(icon);
          iconWrapper.innerText = app.title.substring(0, 2);
          iconWrapper.style.backgroundImage = `url("https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg")`;
        });
        icon.src = `/${app.name}/icon-no-default`;

        iconWrapper.appendChild(icon);
        icons.push(iconWrapper);
      });

      bundleIconsWrapper.removeChild(bundleIcons);

      icons.forEach((icon) => {
        bundleIconsWrapper.prepend(icon);
      });
    }
  }

  const entityCardTitle = clone.querySelector(".package-card-title");
  entityCardTitle.innerText = entity.store_front["display-name"].replace(
    /-/g,
    " "
  );

  if (entity.result.publisher["display-name"] === null) {
    entity.result.publisher["display-name"] = "";
  }

  const entityCardPublisher = clone.querySelector(".package-card-publisher");
  const newCardPublisherText = truncateString(
    entity.result.publisher["display-name"],
    22
  );
  entityCardPublisher.innerText = newCardPublisherText;
  if (newCardPublisherText !== entity.result.publisher["display-name"]) {
    entityCardPublisher.setAttribute(
      "title",
      entity.result.publisher["display-name"]
    );
  }

  const entityCardSummary = clone.querySelector(".package-card-summary");

  if (entityCardSummary && entity.result.summary) {
    entityCardSummary.innerHTML = truncateString(entity.result.summary, 60);
  }

  const entityCardIcons = clone.querySelector(".package-card-icons");
  if (entity.store_front["deployable-on"].includes("kubernetes")) {
    buildPlatformIcons(
      entityCardIcons,
      "Kubernetes",
      "https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg",
      "This operator drives the application on Kubernetes"
    );
  }

  if (entity.store_front["deployable-on"].includes("windows")) {
    buildPlatformIcons(
      entityCardIcons,
      "Windows",
      "https://assets.ubuntu.com/v1/ff17c4fe-Windows.svg",
      "This operator drives the application on Windows servers"
    );
  }

  if (entity.store_front["deployable-on"].includes("vm")) {
    buildPlatformIcons(
      entityCardIcons,
      "VM",
      "https://assets.ubuntu.com/v1/a911ecf6-vm-badge.svg",
      "This operator drives the application on Linux servers"
    );
  }

  if (entity.store_front["deployable-on"].includes("all")) {
    buildPlatformIcons(
      entityCardIcons,
      "VM",
      "https://assets.ubuntu.com/v1/a911ecf6-vm-badge.svg",
      "This operator drives the application on Linux servers"
    );
    buildPlatformIcons(
      entityCardIcons,
      "Kubernetes",
      "https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg",
      "This operator drives the application on Kubernetes"
    );
  }

  return clone;
}

export default buildPackageCard;
