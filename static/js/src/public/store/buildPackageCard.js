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

function buildPackageCard(entity, opsBadges) {
  const entityCard = document.getElementById("package-card");
  const clone = entityCard.content.cloneNode(true);

  const entityCardContainer = clone.querySelector("[data-js='card-container']");
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

    if (entity.apps && entity.apps.length > 2) {
      bundleIconsCount.innerText = `+${entity.apps.length - 2}`;
    }
    Array.from(bundleThumbnails).forEach((thumbnail, count) => {
      if (entity.apps && entity.apps[count]) {
        thumbnail.src = `/${entity.apps[count]}/icon`;
      } else {
        thumbnail.src =
          "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_64,h_64/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
      }
    });
  }

  const entityCardTitle = clone.querySelector(".package-card-title");
  entityCardTitle.innerText = entity.name.replace(/-/g, " ");

  const entityCardPublisher = clone.querySelector(".package-card-publisher");
  let newCardPublisherText = truncateString(
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

  const charmFrameworkTypeIcon = clone.querySelector(
    "[data-js-charm-framework-type-icon]"
  );

  const charmFrameworkTypeText = clone.querySelector(
    "[data-js-charm-framework-type-text]"
  );

  const charmFrameworkTypeTooltipWrapper = clone.querySelector(
    "[data-js-tooltip-wrapper]"
  );

  const tooltip = document.createElement("span");
  tooltip.classList.add("p-tooltip__message");
  tooltip.innerText = `While many Reactive Framework charms work
on machines today, it is recommended to
create new charms with the Operator Framework.`;

  const badge = opsBadges[entity.name];

  if (badge) {
    charmFrameworkTypeIcon.classList.add("p-icon--success");
    charmFrameworkTypeText.innerText = "Operator framework";

    const functionIcons = clone.querySelectorAll("[data-js-function]");

    functionIcons.forEach((icon) => {
      if (badge[icon.dataset.jsFunction] === true) {
        icon.classList.add("p-icon--success");
      } else {
        icon.classList.add("p-icon--cross-grey");
      }
    });
  } else {
    const cardFooter = clone.querySelector("[data-js-card-footer]");
    const functionalityButton = clone.querySelector(
      "[data-js-functionality-button]"
    );
    cardFooter.removeChild(functionalityButton);

    charmFrameworkTypeIcon.classList.add("p-icon--information");
    charmFrameworkTypeText.innerText = "Reactive";
    charmFrameworkTypeTooltipWrapper.classList.add("p-tooltip--btm-center");
    charmFrameworkTypeTooltipWrapper.appendChild(tooltip);
  }

  const entityCardSummary = clone.querySelector(".package-card-summary");

  if (entity.result.summary) {
    entityCardSummary.innerHTML = truncateString(entity.result.summary, 90);
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

  if (entity.store_front["deployable-on"].includes("linux")) {
    buildPlatformIcons(
      entityCardIcons,
      "Linux",
      "https://assets.ubuntu.com/v1/a911ecf6-vm-badge.svg",
      "This operator drives the application on Linux servers"
    );
  }

  if (entity.store_front["deployable-on"].includes("all")) {
    buildPlatformIcons(
      entityCardIcons,
      "Linux",
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
