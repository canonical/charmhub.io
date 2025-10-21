import DynamicFormManager from "./modules/DynamicFormManager.js";
import CharmSearchBox from "./modules/CharmSearchBox.js";
import initConfirmationModal from "./modules/ConfirmationModal.js";

function getEditMessage(formData, form) {
  const solutionTitle =
    document.querySelector('input[name="title"]')?.value ||
    "[title not provided]";

  const submitter = form.querySelector('button[type="submit"]:focus');
  const action = submitter?.value || formData.action;

  if (action === "submit_for_review") {
    return `Are you sure you want to submit the metadata for "${solutionTitle}" for review? 
            Once submitted, the solution will be reviewed before being published.`;
  } else if (action === "update") {
    return `Are you sure you want to update the metadata for "${solutionTitle}"? 
            These changes will be published immediately without review.`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initConfirmationModal({
    formSelector: ".p-form",
    getMessage: getEditMessage,
  });

  const hideValidationMessage = (container) => {
    const message = container.querySelector(".p-form-validation__message");

    if (message) {
      message.setAttribute("hidden", "");
    }
  };

  const showValidationMessage = (container) => {
    const message = container.querySelector(".p-form-validation__message");

    if (message) {
      message.removeAttribute("hidden");
    }
  };

  document.querySelectorAll(".p-form-validation").forEach((container) => {
    if (!container.classList.contains("is-error")) {
      hideValidationMessage(container);
    }
  });

  const clearValidationState = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.classList.remove("is-error");
      hideValidationMessage(section);
    }
  };

  const form = document.querySelector("form.p-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      document.querySelectorAll(".p-form-validation.is-error").forEach((el) => {
        el.classList.remove("is-error");
        hideValidationMessage(el);
      });

      const requiredValidationFields = [
        {
          listId: "platform-version-list",
          sectionId: "platform-version-section",
          selector: ".platform-version-item",
        },
        {
          listId: "juju-versions-list",
          sectionId: "juju-versions-section",
          selector: ".juju-version-item",
        },
        {
          listId: "maintainers-list",
          sectionId: "maintainers-section",
          selector: ".maintainer-item",
        },
        {
          listId: "use-cases-list",
          sectionId: "use-cases-section",
          selector: ".use-case-item",
        },
        {
          listId: "selected-charms",
          sectionId: "selected-charms-section",
          selector: "[data-charm-name]",
        },
      ];

      for (const field of requiredValidationFields) {
        const container = document.getElementById(field.listId);
        const section = document.getElementById(field.sectionId);

        if (container && section) {
          const items = container.querySelectorAll(field.selector);
          if (items.length === 0) {
            event.preventDefault();

            section.classList.add("is-error");
            showValidationMessage(section);

            section.scrollIntoView({
              behavior: "smooth",
            });

            return false;
          }
        }
      }
    });
  }

  new CharmSearchBox({
    searchFilterId: "charm-search-filter",
    searchInputId: "charm-search",
    resultsPanelId: "charm-results-panel",
    resultsContainerId: "charm-results",
    resultsSectionId: "charm-results-section",
    noResultsSectionId: "charm-no-results",
    selectedContainerId: "selected-charms",
    selectedSectionId: "selected-charms-section",
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
    onChange: (count) => {
      if (count > 0) {
        clearValidationState("use-cases-section");
      }
    },
  });

  void new DynamicFormManager({
    listContainerId: "maintainers-list",
    addButtonId: "add-maintainer",
    removeSelector: "remove-maintainer",
    itemSelector: ".maintainer-item",
    templateId: "maintainer-template",
    onChange: (count) => {
      if (count > 0) {
        clearValidationState("maintainers-section");
      }
    },
  });

  void new DynamicFormManager({
    listContainerId: "platform-version-list",
    addButtonId: "add-platform-version",
    removeSelector: "remove-platform-version",
    itemSelector: ".platform-version-item",
    templateId: "platform-version-template",
    onChange: (count) => {
      if (count > 0) {
        clearValidationState("platform-version-section");
      }
    },
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
    onChange: (count) => {
      if (count > 0) {
        clearValidationState("juju-versions-section");
      }
    },
  });
});
