import { truncateString } from "../../libs/truncate-string";

type Entity = {
  type: string;
  name: string;
  store_front: {
    icons: string[];
    "display-name": string;
    "deployable-on": string[];
  };
  result: {
    publisher: {
      "display-name": string;
    };
    summary: string;
  };
  apps: {
    name: string;
    title: string;
  }[];
};
function buildPlatformIcons(
  entityCardIcons: Element,
  altText: string,
  srcText: string,
  text: string
) {
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

function buildPackageCard(entity: Entity) {
  const entityCard = document.getElementById(
    `package-card-${entity.type}`
  ) as HTMLTemplateElement;
  const clone = entityCard.content.cloneNode(true) as HTMLElement;

  const entityCardContainer = clone.querySelector(
    "[data-js='card-container']"
  ) as HTMLElement;
  entityCardContainer.id = entity.name;

  const entityCardButton = clone.querySelector(
    ".p-card--button"
  ) as HTMLAnchorElement;
  entityCardButton.href = `/${entity.name}`;

  const iconContainer = clone.querySelector(
    ".p-card__thumbnail-container"
  ) as HTMLElement;

  if (entity.type === "charm") {
    const charmIcon = iconContainer.querySelector(
      ".p-card__thumbnail"
    ) as HTMLImageElement;
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
    const bundleIconsWrapper = clone.querySelector(
      ".p-bundle-icons"
    ) as HTMLElement;
    const bundleIcons = bundleIconsWrapper.querySelector(
      "img"
    ) as HTMLImageElement | null;

    if (!entity.apps || entity.apps.length === 0) {
      const icon = document.createElement("span");
      icon.setAttribute("class", "p-bundle-icon");
      icon.style.backgroundImage =
        "url(https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg)";
      if (bundleIcons) {
        bundleIcons.replaceWith(icon);
      } else {
        const newIconWrapper = document.createElement("div");
        newIconWrapper.appendChild(icon);
        bundleIconsWrapper.appendChild(newIconWrapper);
      }
    } else {
      const icons: HTMLSpanElement[] = [];
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

      if (bundleIcons) {
        bundleIconsWrapper.removeChild(bundleIcons);
      }

      icons.forEach((icon) => {
        bundleIconsWrapper.prepend(icon);
      });
    }
  }

  const entityCardTitle = clone.querySelector(
    ".package-card-title"
  ) as HTMLElement;
  entityCardTitle.innerText = entity.store_front["display-name"].replace(
    /-/g,
    " "
  );

  if (entity.result.publisher["display-name"] === null) {
    entity.result.publisher["display-name"] = "";
  }

  const entityCardPublisher = clone.querySelector(
    ".package-card-publisher"
  ) as HTMLElement;
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

  const entityCardIcons = clone.querySelector(
    ".package-card-icons"
  ) as HTMLElement;
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
      "Machine",
      "https://assets.ubuntu.com/v1/bf61e269-machine-badge.svg",
      "This operator drives the application on Linux servers"
    );
  }

  if (entity.store_front["deployable-on"].includes("all")) {
    buildPlatformIcons(
      entityCardIcons,
      "Machine",
      "https://assets.ubuntu.com/v1/bf61e269-machine-badge.svg",
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
