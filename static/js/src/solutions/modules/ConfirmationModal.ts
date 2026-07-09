type ConfirmationFormData = Record<string, FormDataEntryValue>;

type ConfirmationModalConfig = {
  formSelector: string;
  getMessage: (
    formData: ConfirmationFormData,
    form: HTMLFormElement
  ) => string | undefined;
  beforeSubmit?: (
    form: HTMLFormElement,
    submitter: SubmitterElement | null
  ) => void | Promise<void>;
};

type SubmitterElement = HTMLButtonElement | HTMLInputElement;

declare global {
  interface Window {
    validateSolutionForm?: () => boolean;
  }
}

function initConfirmationModal(config: ConfirmationModalConfig): void {
  const form = document.querySelector(
    config.formSelector
  ) as HTMLFormElement | null;
  const modal = document.getElementById("solution-confirmation-modal");
  const modalMessage = document.getElementById("modal-message");
  const confirmButton = document.getElementById(
    "modal-confirm"
  ) as HTMLButtonElement | null;
  const cancelButton = document.getElementById(
    "modal-cancel"
  ) as HTMLButtonElement | null;
  const closeButton = modal?.querySelector(
    ".p-modal__close"
  ) as HTMLElement | null;

  if (!form || !modal || !modalMessage || !confirmButton || !cancelButton) {
    console.error("ConfirmationModal: Required elements not found");
    return;
  }

  let formSubmitted = false;
  let submitter: SubmitterElement | null = null;
  const originalButtonText = confirmButton.textContent;

  const hideSubmitError = (): void => {
    document.getElementById("solution-submit-error")?.classList.add("u-hide");
  };

  const showSubmitError = (message: string): void => {
    const notification = document.getElementById("solution-submit-error");
    const notificationMessage = notification?.querySelector(
      ".p-notification__message"
    );

    if (!notification || !notificationMessage) {
      console.error("Submit error notification: element not found");
      return;
    }

    notificationMessage.textContent = message;
    notification.classList.remove("u-hide");
    notification.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submitForm = async (): Promise<void> => {
    formSubmitted = true;

    if (typeof config.beforeSubmit === "function") {
      try {
        await config.beforeSubmit(form, submitter);
      } catch (error) {
        formSubmitted = false;
        confirmButton.textContent = originalButtonText;
        confirmButton.disabled = false;
        modal.classList.add("u-hide");
        showSubmitError(
          error instanceof Error
            ? error.message
            : "Unable to submit the form. Please try again."
        );
        return;
      }
    }

    if (form.requestSubmit) {
      form.requestSubmit(submitter || undefined);
    } else {
      form.submit();
    }
  };

  form.addEventListener("submit", (event: SubmitEvent) => {
    if (formSubmitted) {
      return;
    }

    submitter =
      event.submitter instanceof HTMLButtonElement ||
      event.submitter instanceof HTMLInputElement
        ? event.submitter
        : null;
    const shouldValidate = !submitter?.formNoValidate;
    hideSubmitError();

    event.preventDefault();
    event.stopPropagation();

    if (shouldValidate && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (
      shouldValidate &&
      window.validateSolutionForm &&
      !window.validateSolutionForm()
    ) {
      return;
    }

    const formData = new FormData(form);
    const formObject = Object.fromEntries(
      formData.entries()
    ) as ConfirmationFormData;
    const message = config.getMessage(formObject, form);

    if (!message) {
      submitForm();
      return;
    }

    modalMessage.textContent = message;
    modal.classList.remove("u-hide");
    confirmButton.focus();
  });

  confirmButton.addEventListener("click", () => {
    const spinner = document.createElement("i");
    spinner.className = "p-icon--spinner u-animation--spin is-dark";

    confirmButton.textContent = "";
    confirmButton.appendChild(spinner);
    confirmButton.disabled = true;

    submitForm();
  });

  const closeModal = (): void => {
    modal.classList.add("u-hide");
    confirmButton.textContent = originalButtonText;
    confirmButton.disabled = false;
  };

  cancelButton.addEventListener("click", closeModal);
  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e: MouseEvent) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && !modal.classList.contains("u-hide")) {
      closeModal();
    }
  });
}

export default initConfirmationModal;
