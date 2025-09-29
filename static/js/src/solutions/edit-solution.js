import DynamicFormManager from "./modules/DynamicFormManager.js";
import CharmSearchBox from "./modules/CharmSearchBox.js";

document.addEventListener("DOMContentLoaded", function () {
  new CharmSearchBox({
    searchFilterId: "charm-search-filter",
    searchInputId: "charm-search",
    resultsPanelId: "charm-results-panel",
    resultsContainerId: "charm-results",
    resultsSectionId: "charm-results-section",
    noResultsSectionId: "charm-no-results",
    selectedContainerId: "selected-charms",
    manualCharmInputId: "manual-charm-name",
    addManualButtonId: "add-manual-charm",
    apiEndpoint: "/all-charms",
  });

  void new DynamicFormManager({
    listContainerId: "useful-links-list",
    addButtonId: "add-useful-link",
    maxItems: 3,
    removeSelector: "remove-useful-link",
    itemSelector: ".useful-link-item",
    createItemFunction: createUsefulLinkItem,
  });

  void new DynamicFormManager({
    listContainerId: "use-cases-list",
    addButtonId: "add-use-case",
    maxItems: 3,
    removeSelector: "remove-use-case",
    itemSelector: ".use-case-item",
    createItemFunction: createUseCaseItem,
  });

  void new DynamicFormManager({
    listContainerId: "maintainers-list",
    addButtonId: "add-maintainer",
    removeSelector: "remove-maintainer",
    itemSelector: ".maintainer-item",
    createItemFunction: createMaintainerItem,
  });

  void new DynamicFormManager({
    listContainerId: "platform-version-list",
    addButtonId: "add-platform-version",
    removeSelector: "remove-platform-version",
    itemSelector: ".platform-version-item",
    createItemFunction: createPlatformVersionItem,
  });

  void new DynamicFormManager({
    listContainerId: "platform-prerequisites-list",
    addButtonId: "add-platform-prerequisite",
    removeSelector: "remove-platform-prerequisite",
    itemSelector: ".platform-prerequisite-item",
    createItemFunction: createPlatformPrerequisiteItem,
  });

  void new DynamicFormManager({
    listContainerId: "juju-versions-list",
    addButtonId: "add-juju-version",
    removeSelector: "remove-juju-version",
    itemSelector: ".juju-version-item",
    createItemFunction: createJujuVersionItem,
  });

  function createUsefulLinkItem() {
    const linkItem = document.createElement("div");
    linkItem.className = "useful-link-item p-form--inline";
    linkItem.innerHTML = `
      <button type="button" class="p-button--negative has-icon is-small remove-useful-link" aria-label="Remove link">
        <i class="p-icon--delete is-dark"></i>
      </button>
      <div class="p-form__group">
        <div class="p-form__control">
          <input class="p-form__control useful-link-title"
            type="text"
            name="useful_links_title[]"
            placeholder="Title: e.g., How to operate"
          >
        </div>
      </div>
      <div class="p-form__group">
        <div class="p-form__control">
          <input class="p-form__control useful-link-url"
            type="url"
            name="useful_links_url[]"
            placeholder="URL: https://example.com"
          >
        </div>
      </div>
    `;
    return linkItem;
  }

  function createUseCaseItem() {
    const caseItem = document.createElement("div");
    caseItem.className = "use-case-item";
    caseItem.innerHTML = `
      <div class="p-form--inline">
        <div class="p-form__group">
          <div class="p-form__control">
            <input class="p-form__control use-case-title"
              type="text"
              name="use_cases_title[]"
              placeholder="Title: e.g., Log aggregation"
            >
          </div>
        </div>
        <button type="button" class="p-button--negative has-icon is-small remove-use-case" aria-label="Remove use case">
          <i class="p-icon--delete is-dark"></i>
        </button>
      </div>
      <div class="p-form__group">
        <div class="p-form__control">
          <textarea class="p-form__control use-case-description"
            name="use_cases_description[]"
            rows="2"
            placeholder="Description: Describe this use case..."
          ></textarea>
        </div>
      </div>
    `;
    return caseItem;
  }

  function createMaintainerItem() {
    const maintainerItem = document.createElement("div");
    maintainerItem.className = "maintainer-item p-form--inline";
    maintainerItem.innerHTML = `
      <button type="button" class="p-button--negative has-icon is-small remove-maintainer" aria-label="Remove maintainer">
        <i class="p-icon--delete is-dark"></i>
      </button>
      <div class="p-form__group">
        <div class="p-form__control">
          <input class="p-form__control maintainer-email"
            type="email"
            name="maintainers_email[]"
            placeholder="john@canonical.com"
          >
        </div>
      </div>
    `;
    return maintainerItem;
  }

  function createPlatformVersionItem() {
    const versionItem = document.createElement("div");
    versionItem.className = "platform-version-item p-form--inline";
    versionItem.innerHTML = `
      <button type="button" class="p-button--negative has-icon is-small remove-platform-version" aria-label="Remove version">
        <i class="p-icon--delete is-dark"></i>
      </button>
      <div class="p-form__group">
        <div class="p-form__control">
          <input class="p-form__control platform-version-input"
            type="text"
            name="platform_version[]"
            placeholder="e.g., 1.25"
          >
        </div>
      </div>
    `;
    return versionItem;
  }

  function createPlatformPrerequisiteItem() {
    const prerequisiteItem = document.createElement("div");
    prerequisiteItem.className = "platform-prerequisite-item p-form--inline";
    prerequisiteItem.innerHTML = `
      <button type="button" class="p-button--negative has-icon is-small remove-platform-prerequisite" aria-label="Remove prerequisite">
        <i class="p-icon--delete is-dark"></i>
      </button>
      <div class="p-form__group">
        <div class="p-form__control">
          <input class="p-form__control platform-prerequisite-input"
            type="text"
            name="platform_prerequisites[]"
            placeholder="e.g., GPU support"
          >
        </div>
      </div>
    `;
    return prerequisiteItem;
  }

  function createJujuVersionItem() {
    const versionItem = document.createElement("div");
    versionItem.className = "juju-version-item p-form--inline";
    versionItem.innerHTML = `
      <button type="button" class="p-button--negative has-icon is-small remove-juju-version" aria-label="Remove version">
        <i class="p-icon--delete is-dark"></i>
      </button>
      <div class="p-form__group">
        <div class="p-form__control">
          <input class="p-form__control juju-version-input"
            type="text"
            name="juju_versions[]"
            placeholder="e.g., 3.1"
          >
        </div>
      </div>
    `;
    return versionItem;
  }
});
