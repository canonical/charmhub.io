const DRAFT_STORAGE_PREFIX = "solution-edit-draft";
const DRAFT_SAVE_DELAY = 500;
const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REPEATED_FIELD_CONFIGS = [
  [
    "useful_links_title[]",
    "add-useful-link",
    ".useful-link-item",
    ".remove-useful-link",
    "useful-links-list",
  ],
  [
    "use_cases_title[]",
    "add-use-case",
    ".use-case-item",
    ".remove-use-case",
    "use-cases-list",
  ],
  [
    "maintainers_email[]",
    "add-maintainer",
    ".maintainer-item",
    ".remove-maintainer",
    "maintainers-list",
  ],
  [
    "platform_version[]",
    "add-platform-version",
    ".platform-version-item",
    ".remove-platform-version",
    "platform-version-list",
  ],
  [
    "platform_prerequisites[]",
    "add-platform-prerequisite",
    ".platform-prerequisite-item",
    ".remove-platform-prerequisite",
    "platform-prerequisites-list",
  ],
  [
    "juju_versions[]",
    "add-juju-version",
    ".juju-version-item",
    ".remove-juju-version",
    "juju-versions-list",
  ],
];
const DRAFT_ARRAY_FIELD_NAMES = [
  ...REPEATED_FIELD_CONFIGS.map(([name]) => name),
  "useful_links_url[]",
  "use_cases_description[]",
  "charms[]",
];

function getDraftStorageKey(form) {
  return `${DRAFT_STORAGE_PREFIX}:${window.location.pathname}:${form.getAttribute(
    "action"
  )}`;
}

function getFormValues(form) {
  const values = {};

  for (const [name, value] of new FormData(form).entries()) {
    if (["csrf_token", "action", "charm-search"].includes(name)) {
      continue;
    }

    if (!values[name]) {
      values[name] = [];
    }

    values[name].push(value);
  }

  // keep empty repeated fields in the draft so removed items stay removed
  DRAFT_ARRAY_FIELD_NAMES.forEach((name) => {
    if (!values[name]) {
      values[name] = [];
    }
  });

  return values;
}

const serializeForm = (form) => JSON.stringify(getFormValues(form));

function setAutosaveStatus(message) {
  const status = document.getElementById("local-autosave-status");

  if (status) {
    status.textContent = message;
  }
}

function getFormattedTime(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });
}

function saveLocalDraft(form) {
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

function removeLocalDraft(form) {
  try {
    window.localStorage.removeItem(getDraftStorageKey(form));
  } catch (error) {
    console.warn("Failed to remove solution draft", error);
  }
}

function getLocalDraft(form) {
  try {
    const draftJson = window.localStorage.getItem(getDraftStorageKey(form));
    const draft = draftJson ? JSON.parse(draftJson) : null;
    const savedAt = Date.parse(draft?.savedAt);

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

function restoreRepeatedFields(draftValues) {
  REPEATED_FIELD_CONFIGS.forEach(
    ([name, addButtonId, itemSelector, removeSelector, containerId]) => {
      const values = draftValues[name];
      const container = document.getElementById(containerId);
      const addButton = document.getElementById(addButtonId);

      if (!values || !container || !addButton) {
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
          ?.querySelector(removeSelector)
          ?.click();
      }
    }
  );
}

function restoreCharms(draftValues) {
  const charms = draftValues["charms[]"];
  const selectedCharms = document.getElementById("selected-charms");
  const template = document.getElementById("charm-item-template");

  if (!charms || !selectedCharms || !template) {
    return;
  }

  selectedCharms.innerHTML = "";

  charms.forEach((charmName) => {
    const item = template.content
      .cloneNode(true)
      .querySelector("[data-charm-name]");

    if (!item) {
      return;
    }

    item.dataset.charmName = charmName;
    item.querySelector("span").textContent = charmName;
    item.querySelector('input[name="charms[]"]').value = charmName;
    item
      .querySelector("button")
      ?.setAttribute("aria-label", `Remove ${charmName}`);
    selectedCharms.appendChild(item);
  });
}

function restoreLocalDraft(form) {
  const draft = getLocalDraft(form);

  if (!draft?.values) {
    return;
  }

  restoreRepeatedFields(draft.values);
  restoreCharms(draft.values);

  Object.entries(draft.values).forEach(([name, values]) => {
    const fields = Array.from(form.elements).filter(
      (field) => field.name === name
    );

    fields.forEach((field, index) => {
      if (field.type === "checkbox" || field.type === "radio") {
        field.checked = values.includes(field.value);
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

function initCancelLink(form, discardDraft) {
  const cancelLink = document.getElementById("cancel-edit-solution");
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

function initLocalAutosave(form) {
  let saveTimeout;
  let skipBeforeUnloadSave = false;
  restoreLocalDraft(form);

  // compare against the restored state so untouched forms do not create drafts
  const initialValues = serializeForm(form);
  let lastAutosavedValues = initialValues;
  const saveChanges = () => {
    const currentValues = serializeForm(form);

    // remove the draft if the user returns the form to its starting values
    if (currentValues === initialValues) {
      removeLocalDraft(form);
    } else {
      saveLocalDraft(form);
    }

    lastAutosavedValues = currentValues;
  };
  const hasChanges = () => serializeForm(form) !== lastAutosavedValues;
  const discardDraft = () => {
    skipBeforeUnloadSave = true;
    window.clearTimeout(saveTimeout);
    removeLocalDraft(form);
  };
  const scheduleSave = () => {
    window.clearTimeout(saveTimeout);

    if (!skipBeforeUnloadSave && hasChanges()) {
      saveTimeout = window.setTimeout(saveChanges, DRAFT_SAVE_DELAY);
    }
  };

  initCancelLink(form, discardDraft);
  form.addEventListener("input", scheduleSave);
  form.addEventListener("change", scheduleSave);
  form.addEventListener("click", () => window.setTimeout(scheduleSave, 0));
  form.addEventListener("submit", (event) => {
    if (!event.defaultPrevented) {
      discardDraft();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (!skipBeforeUnloadSave && hasChanges()) {
      saveChanges();
    }
  });
}

export default initLocalAutosave;
