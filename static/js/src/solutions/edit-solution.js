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
    templateId: "useful-link-template",
  });

  void new DynamicFormManager({
    listContainerId: "use-cases-list",
    addButtonId: "add-use-case",
    maxItems: 3,
    removeSelector: "remove-use-case",
    itemSelector: ".use-case-item",
    templateId: "use-case-template",
  });

  void new DynamicFormManager({
    listContainerId: "maintainers-list",
    addButtonId: "add-maintainer",
    removeSelector: "remove-maintainer",
    itemSelector: ".maintainer-item",
    templateId: "maintainer-template",
  });

  void new DynamicFormManager({
    listContainerId: "platform-version-list",
    addButtonId: "add-platform-version",
    removeSelector: "remove-platform-version",
    itemSelector: ".platform-version-item",
    templateId: "platform-version-template",
  });

  void new DynamicFormManager({
    listContainerId: "platform-prerequisites-list",
    addButtonId: "add-platform-prerequisite",
    removeSelector: "remove-platform-prerequisite",
    itemSelector: ".platform-prerequisite-item",
    templateId: "platform-prerequisite-template",
  });

  void new DynamicFormManager({
    listContainerId: "juju-versions-list",
    addButtonId: "add-juju-version",
    removeSelector: "remove-juju-version",
    itemSelector: ".juju-version-item",
    templateId: "juju-version-template",
  });
});
