import buildPackageCard from "../buildPackageCard";
import { truncateString } from "../../../libs/truncate-string";

describe("buildPackageCard", () => {
  beforeEach(() => {
    const charmTemplate = document.createElement("template");
    charmTemplate.id = "package-card-charm";
    charmTemplate.innerHTML = `
      <div data-js="card-container"></div>
      <a class="p-card--button"></a>
      <div class="p-card__thumbnail-container">
        <img class="p-card__thumbnail" />
      </div>
      <div class="p-bundle-icons"></div>
      <div class="package-card-title"></div>
      <div class="package-card-publisher"></div>
      <div class="package-card-summary"></div>
      <div class="package-card-icons"></div>
    `;
    document.body.appendChild(charmTemplate);

    const bundleTemplate = document.createElement("template");
    bundleTemplate.id = "package-card-bundle";
    bundleTemplate.innerHTML = `
      <div data-js="card-container"></div>
      <a class="p-card--button"></a>
      <div class="p-card__thumbnail-container"></div>
      <div class="p-bundle-icons"></div>
      <div class="package-card-title"></div>
      <div class="package-card-publisher"></div>
      <div class="package-card-summary"></div>
      <div class="package-card-icons"></div>
    `;
    document.body.appendChild(bundleTemplate);
  });

  afterEach(() => {
    const charmTemplate = document.getElementById("package-card-charm");
    if (charmTemplate) {
      document.body.removeChild(charmTemplate);
    }

    const bundleTemplate = document.getElementById("package-card-bundle");
    if (bundleTemplate) {
      document.body.removeChild(bundleTemplate);
    }
  });

  test('should build a package card for a "charm" type entity', () => {
    const entity = {
      type: "charm",
      name: "test-charm",
      store_front: {
        icons: ["test-icon.svg"],
        "display-name": "Test Charm",
        "deployable-on": ["kubernetes"],
      },
      result: {
        publisher: {
          "display-name": "Test Publisher",
        },
        summary: "This is a test summary.",
      },
      apps: [],
    };

    const result = buildPackageCard(entity);

    expect(result.querySelector("[data-js='card-container']")?.id).toBe(
      "test-charm"
    );

    expect(result.querySelector(".p-card--button")?.getAttribute("href")).toBe(
      "/test-charm"
    );

    const charmIcon = result.querySelector(
      ".p-card__thumbnail"
    ) as HTMLImageElement;
    expect(charmIcon.alt).toBe("test-charm");
    expect(charmIcon.src).toBe(
      "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/test-icon.svg"
    );

    const title = result.querySelector(".package-card-title") as HTMLElement;
    expect(title.innerText).toBe("Test Charm");

    const publisher = result.querySelector(
      ".package-card-publisher"
    ) as HTMLElement;
    expect(publisher.innerText).toBe(truncateString("Test Publisher", 22));

    const summary = result.querySelector(
      ".package-card-summary"
    ) as HTMLElement;
    expect(summary.innerHTML).toBe(
      truncateString("This is a test summary.", 60)
    );

    const icons = result.querySelector(".package-card-icons") as HTMLElement;
    expect(icons.children.length).toBe(1);
    expect(icons.querySelector("img")?.src).toBe(
      "https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg"
    );
  });

  test("should handle missing charm icons", () => {
    const entity = {
      type: "charm",
      name: "test-charm",
      store_front: {
        icons: [],
        "display-name": "Test Charm",
        "deployable-on": [],
      },
      result: {
        publisher: {
          "display-name": "Test Publisher",
        },
        summary: "This is a test summary.",
      },
      apps: [],
    };

    const result = buildPackageCard(entity);

    const charmIcon = result.querySelector(
      ".p-card__thumbnail"
    ) as HTMLImageElement;
    expect(charmIcon.src).toBe(
      "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg"
    );
  });

  test("should handle bundle icons correctly", () => {
    const entity = {
      type: "bundle",
      name: "test-bundle",
      store_front: {
        icons: [],
        "display-name": "Test Bundle",
        "deployable-on": [],
      },
      result: {
        publisher: {
          "display-name": "Test Publisher",
        },
        summary: "This is a test summary.",
      },
      apps: [
        { name: "app1", title: "App One" },
        { name: "app2", title: "App Two" },
      ],
    };

    const result = buildPackageCard(entity);

    const iconsWrapper = result.querySelector(".p-bundle-icons") as HTMLElement;
    if (iconsWrapper) {
      expect(iconsWrapper.children.length).toBe(2);

      // App Two will come first due to `prepend` logic
      const app2Icon = iconsWrapper.querySelectorAll(
        ".p-bundle-icon"
      )[0] as HTMLElement;
      expect(app2Icon.title).toBe("App Two");

      const app1Icon = iconsWrapper.querySelectorAll(
        ".p-bundle-icon"
      )[1] as HTMLElement;
      expect(app1Icon.title).toBe("App One");
    }
  });

  test("should handle empty apps array in bundle", () => {
    const entity = {
      type: "bundle",
      name: "test-bundle",
      store_front: {
        icons: [],
        "display-name": "Test Bundle",
        "deployable-on": [],
      },
      result: {
        publisher: {
          "display-name": "Test Publisher",
        },
        summary: "This is a test summary.",
      },
      apps: [],
    };

    const result = buildPackageCard(entity);

    const bundleIcons = result.querySelector(".p-bundle-icons") as HTMLElement;
    if (bundleIcons) {
      expect(bundleIcons.children.length).toBe(1);
      expect(
        bundleIcons.querySelector<HTMLElement>(".p-bundle-icon")?.style
          .backgroundImage
      ).toBe(
        `url("https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_24,h_24/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg")`
      );
    }
  });
});
