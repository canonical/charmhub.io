import DynamicFormManager from "./modules/DynamicFormManager.js";
import CharmSearchBox from "./modules/CharmSearchBox.js";
import initConfirmationModal from "./modules/ConfirmationModal.js";
import initLocalAutosave from "./modules/LocalAutosave.js";
import CategorySelector from "./modules/CategorySelector.js";

const CSRF_TOKEN_ENDPOINT = "/api/solutions/csrf-token";
const CSRF_REFRESH_ACTIONS = [
  "preview",
  "save_draft",
  "submit_for_review",
  "update",
];
const CSRF_REFRESH_ERROR =
  "Unable to refresh your session token. Please try again.";

type CsrfTokenResponse = {
  csrf_token?: string;
};

type PreviewResponse = {
  success?: boolean;
  preview_key?: string;
  error?: string;
  errors?: { message: string }[];
};

type ConfirmationFormData = Record<string, FormDataEntryValue>;

async function refreshCsrfToken(form: HTMLFormElement): Promise<void> {
  const response = await fetch(CSRF_TOKEN_ENDPOINT, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/json")
  ) {
    throw new Error(CSRF_REFRESH_ERROR);
  }

  let data: CsrfTokenResponse;
  try {
    data = (await response.json()) as CsrfTokenResponse;
  } catch (_error) {
    throw new Error(CSRF_REFRESH_ERROR);
  }

  const csrfInput = form.querySelector(
    'input[name="csrf_token"]'
  ) as HTMLInputElement | null;

  if (!data.csrf_token || !csrfInput) {
    throw new Error(CSRF_REFRESH_ERROR);
  }

  csrfInput.value = data.csrf_token;
}

function refreshCsrfTokenBeforeSubmit(
  form: HTMLFormElement,
  submitter: HTMLButtonElement | HTMLInputElement | null
): void | Promise<void> {
  const action =
    submitter?.value ||
    String(new FormData(form).get("action") || "save_draft");

  if (CSRF_REFRESH_ACTIONS.includes(action)) {
    return refreshCsrfToken(form);
  }
}

function getEditMessage(
  formData: ConfirmationFormData,
  form: HTMLFormElement
): string | undefined {
  const solutionTitle =
    (document.querySelector('input[name="title"]') as HTMLInputElement | null)
      ?.value || "[title not provided]";

  const submitter = form.querySelector(
    'button[type="submit"]:focus'
  ) as HTMLButtonElement | null;
  const action = submitter?.value || String(formData.action || "");

  if (action === "submit_for_review") {
    return `Are you sure you want to submit the metadata for "${solutionTitle}" for review? 
            Once submitted, the solution will be reviewed before being published.`;
  } else if (action === "update") {
    return `Are you sure you want to update the metadata for "${solutionTitle}"? 
            These changes will be published immediately without review.`;
  }

  return undefined;
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.p-form") as HTMLFormElement | null;

  if (!form) {
    return;
  }

  initConfirmationModal({
    formSelector: ".p-form",
    getMessage: getEditMessage,
    beforeSubmit: refreshCsrfTokenBeforeSubmit,
  });

  const categorySelector = new CategorySelector();

  const previewButton = document.getElementById(
    "preview-button"
  ) as HTMLButtonElement | null;

  if (previewButton) {
    const submitPreviewForm = async () => {
      const formData = new FormData(form);
      formData.set("action", "preview");

      try {
        await refreshCsrfToken(form);
        const csrfInput = form.querySelector(
          'input[name="csrf_token"]'
        ) as HTMLInputElement | null;

        if (!csrfInput) {
          throw new Error(CSRF_REFRESH_ERROR);
        }

        formData.set("csrf_token", csrfInput.value);

        const formAction = form.getAttribute("action") || window.location.href;
        const response = await fetch(formAction, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = (await response.json()) as PreviewResponse;
            let errorMessage =
              "Failed to save and preview. Please check the form for errors.";

            if (data.error) {
              errorMessage = data.error;
            } else if (data.errors && data.errors.length > 0) {
              errorMessage = data.errors.map((e) => e.message).join("\n");
            }

            alert(errorMessage);
          } else {
            alert(
              `Server error (${response.status}). Please check the form for errors.`
            );
          }
          return;
        }

        const data = (await response.json()) as PreviewResponse;

        if (data.success && data.preview_key) {
          window.open(`/solutions/preview-draft/${data.preview_key}`, "_blank");
        } else {
          alert(
            "Failed to generate preview. Please check the form for errors."
          );
        }
      } catch (error) {
        alert(
          `Failed to generate preview: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    previewButton.addEventListener("click", async (event) => {
      event.preventDefault();

      previewButton.disabled = true;
      previewButton.textContent = "Generating preview...";

      await submitPreviewForm();

      previewButton.disabled = false;
      previewButton.textContent = "Preview";
    });
  }

  const hideValidationMessage = (container: Element): void => {
    const message = container.querySelector(".p-form-validation__message");

    if (message) {
      message.setAttribute("hidden", "");
    }
  };

  const showValidationMessage = (container: Element): void => {
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

  const clearValidationState = (sectionId: string): void => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.classList.remove("is-error");
      hideValidationMessage(section);
    }
  };

  const validateForm = (): boolean => {
    document.querySelectorAll(".p-form-validation.is-error").forEach((el) => {
      el.classList.remove("is-error");
      hideValidationMessage(el);
    });

    if (!categorySelector.isValid()) {
      return false;
    }

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
          section.classList.add("is-error");
          showValidationMessage(section);

          section.scrollIntoView({
            behavior: "smooth",
          });

          return false;
        }
      }
    }

    return true;
  };

  window.validateSolutionForm = validateForm;

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
    maxItems: 3,
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
    maxItems: 3,
    onChange: (count) => {
      if (count > 0) {
        clearValidationState("juju-versions-section");
      }
    },
  });

  initLocalAutosave(form);
  categorySelector.enforce();
});
