const DRAFT_STORAGE_PREFIX = "solution-edit-draft";
const DRAFT_SAVE_DELAY = 500;
const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const EXTRA_ARRAY_FIELD_NAMES = [
  "useful_links_url[]",
  "use_cases_description[]",
  "charms[]",
  "categories",
];

type DraftValues = Record<string, string[]>;

interface LocalDraft {
  savedAt: string;
  values: DraftValues;
}

interface MultivalueFieldConfig {
  addButton: HTMLElement | null;
  container: HTMLElement;
  itemSelector: string;
  name: string;
  removeSelector: string;
}

type EditableFormField =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

function getMultivalueFieldConfigs(): MultivalueFieldConfig[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-autosave-multivalue-field]")
  ).map((container) => ({
    addButton: document.getElementById(
      container.dataset.autosaveAddButton as string
    ),
    container,
    itemSelector: container.dataset.autosaveItemSelector as string,
    name: container.dataset.autosaveMultivalueField as string,
    removeSelector: container.dataset.autosaveRemoveSelector as string,
  }));
}

function getArrayFieldNames(): string[] {
  return [
    ...getMultivalueFieldConfigs().map(({ name }) => name),
    ...EXTRA_ARRAY_FIELD_NAMES,
  ];
}

function getDraftStorageKey(form: HTMLFormElement): string {
  return `${DRAFT_STORAGE_PREFIX}:${window.location.pathname}:${form.getAttribute(
    "action"
  )}`;
}

function getFormValues(form: HTMLFormElement): DraftValues {
  const values: DraftValues = {};

  for (const [name, value] of new FormData(form).entries()) {
    if (["csrf_token", "action", "charm-search"].includes(name)) {
      continue;
    }

    if (!values[name]) {
      values[name] = [];
    }

    values[name].push(value as string);
  }

  // keep empty multivalue fields in the draft so removed items stay removed
  getArrayFieldNames().forEach((name) => {
    if (!values[name]) {
      values[name] = [];
    }
  });

  return values;
}

const serializeForm = (form: HTMLFormElement): string =>
  JSON.stringify(getFormValues(form));

function setAutosaveStatus(message: string): void {
  const status = document.getElementById("local-autosave-status");

  if (status) {
    status.textContent = message;
  }
}

function getFormattedTime(date = new Date()): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });
}

function saveLocalDraft(form: HTMLFormElement): void {
  try {
    window.localStorage.setItem(
      getDraftStorageKey(form),
      JSON.stringify({
        savedAt: new Date().toISOString(),
        values: getFormValues(form),
      })
    );
    setAutosaveStatus(
      `Local autosave saved at ${getFormattedTime()}. Edits are saved in this browser only.`
    );
  } catch (error) {
    console.warn("Failed to save solution draft", error);
    setAutosaveStatus("Local autosave could not save your edits.");
  }
}

function removeLocalDraft(form: HTMLFormElement): void {
  try {
    window.localStorage.removeItem(getDraftStorageKey(form));
  } catch (error) {
    console.warn("Failed to remove solution draft", error);
  }
}

function getLocalDraft(form: HTMLFormElement): LocalDraft | null {
  try {
    const draftJson = window.localStorage.getItem(getDraftStorageKey(form));
    const draft = draftJson ? (JSON.parse(draftJson) as LocalDraft) : null;
    const savedAt = Date.parse(draft?.savedAt as string);

    if (
      draft &&
      (Number.isNaN(savedAt) || Date.now() - savedAt > DRAFT_MAX_AGE)
    ) {
      removeLocalDraft(form);
      return null;
    }

    return draft;
  } catch (error) {
    console.warn("Failed to read solution draft", error);
    return null;
  }
}

function restoreMultivalueFields(draftValues: DraftValues): void {
  getMultivalueFieldConfigs().forEach(
    ({ addButton, container, itemSelector, name, removeSelector }) => {
      const values = draftValues[name];

      if (!values || !addButton || !itemSelector || !removeSelector) {
        return;
      }

      while (container.querySelectorAll(itemSelector).length < values.length) {
        const count = container.querySelectorAll(itemSelector).length;
        addButton.click();

        if (container.querySelectorAll(itemSelector).length === count) {
          break;
        }
      }

      while (container.querySelectorAll(itemSelector).length > values.length) {
        container
          .querySelector(itemSelector)
          ?.querySelector<HTMLElement>(removeSelector)
          ?.click();
      }
    }
  );
}

function restoreCharms(draftValues: DraftValues): void {
  const charms = draftValues["charms[]"];
  const selectedCharms = document.getElementById("selected-charms");
  const template = document.getElementById(
    "charm-item-template"
  ) as HTMLTemplateElement | null;

  if (!charms || !selectedCharms || !template) {
    return;
  }

  selectedCharms.innerHTML = "";

  charms.forEach((charmName) => {
    const item = (
      template.content.cloneNode(true) as DocumentFragment
    ).querySelector<HTMLElement>("[data-charm-name]");

    if (!item) {
      return;
    }

    item.dataset.charmName = charmName;
    item.querySelector("span")!.textContent = charmName;
    item.querySelector<HTMLInputElement>('input[name="charms[]"]')!.value =
      charmName;
    item
      .querySelector("button")
      ?.setAttribute("aria-label", `Remove ${charmName}`);
    selectedCharms.appendChild(item);
  });
}

function restoreLocalDraft(form: HTMLFormElement): void {
  const draft = getLocalDraft(form);

  if (!draft?.values) {
    return;
  }

  restoreMultivalueFields(draft.values);
  restoreCharms(draft.values);

  Object.entries(draft.values).forEach(([name, values]) => {
    const fields = Array.from(form.elements)
      .filter(
        (field): field is EditableFormField =>
          field instanceof HTMLInputElement ||
          field instanceof HTMLSelectElement ||
          field instanceof HTMLTextAreaElement
      )
      .filter((field) => field.name === name);

    fields.forEach((field, index) => {
      if (field.type === "checkbox" || field.type === "radio") {
        (field as HTMLInputElement).checked = values.includes(field.value);
        return;
      }

      if (values[index] !== undefined) {
        field.value = values[index];

        if (name === "maintainers_email[]") {
          field
            .closest(".maintainer-item")
            ?.querySelector(".remove-maintainer")
            ?.setAttribute("aria-label", `Remove ${values[index]}`);
        }
      }
    });
  });

  setAutosaveStatus(
    `Restored local autosave from ${getFormattedTime(
      new Date(draft.savedAt)
    )}. Edits are saved in this browser only.`
  );
}

function initCancelLink(form: HTMLFormElement, discardDraft: () => void): void {
  const cancelLink = document.getElementById(
    "cancel-edit-solution"
  ) as HTMLAnchorElement | null;
  const modal = document.getElementById("local-autosave-cancel-modal");
  const keepButton = document.getElementById("local-autosave-cancel-keep");
  const discardButton = document.getElementById(
    "local-autosave-cancel-discard"
  );
  const closeButton = modal?.querySelector(".p-modal__close");

  if (!cancelLink) {
    return;
  }

  const leave = () => {
    discardDraft();
    window.location.href = cancelLink.href;
  };

  const closeModal = () => {
    modal?.classList.add("u-hide");
    cancelLink.focus();
  };

  cancelLink.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!getLocalDraft(form) || !modal) {
      leave();
      return;
    }

    modal.classList.remove("u-hide");
    keepButton?.focus();
  });

  discardButton?.addEventListener("click", leave);
  keepButton?.addEventListener("click", closeModal);
  closeButton?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal?.classList.contains("u-hide")) {
      closeModal();
    }
  });
}

function initLocalAutosave(form: HTMLFormElement): void {
  let saveTimeout: number;
  let skipBeforeUnloadSave = false;
  restoreLocalDraft(form);

  // compare against the restored state so untouched forms do not create drafts
  const initialValues = serializeForm(form);
  let isDirty = false;
  let lastAutosavedValues = initialValues;
  const saveChanges = () => {
    const currentValues = serializeForm(form);

    if (currentValues === lastAutosavedValues) {
      isDirty = false;
      return;
    }

    // remove the draft if the user returns the form to its starting values
    if (currentValues === initialValues) {
      removeLocalDraft(form);
    } else {
      saveLocalDraft(form);
    }

    isDirty = false;
    lastAutosavedValues = currentValues;
  };
  const discardDraft = () => {
    skipBeforeUnloadSave = true;
    window.clearTimeout(saveTimeout);
    removeLocalDraft(form);
  };
  const scheduleSave = () => {
    isDirty = true;
    window.clearTimeout(saveTimeout);

    if (!skipBeforeUnloadSave) {
      saveTimeout = window.setTimeout(saveChanges, DRAFT_SAVE_DELAY);
    }
  };

  initCancelLink(form, discardDraft);
  // input and change fire immediately when a field is edited
  form.addEventListener("input", scheduleSave);
  form.addEventListener("change", scheduleSave);
  // use setTimeout to let clicks on add/remove buttons update multivalue fields before saving
  form.addEventListener("click", () => window.setTimeout(scheduleSave, 0));
  form.addEventListener("submit", (event) => {
    if (!event.defaultPrevented) {
      discardDraft();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (!skipBeforeUnloadSave && isDirty) {
      saveChanges();
    }
  });
}

export default initLocalAutosave;
