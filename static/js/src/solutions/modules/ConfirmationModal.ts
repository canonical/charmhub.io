type ConfirmationFormData = Record<string, FormDataEntryValue>;

interface ConfirmationModalConfig {
  formSelector: string;
  getMessage: (
    formData: ConfirmationFormData,
    form: HTMLFormElement
  ) => string | void;
  beforeSubmit?: (
    form: HTMLFormElement,
    submitter: HTMLElement | null
  ) => void | Promise<void>;
}

declare global {
  interface Window {
    validateSolutionForm?: () => boolean;
  }
}

function initConfirmationModal(config: ConfirmationModalConfig): void {
  const form = document.querySelector<HTMLFormElement>(config.formSelector);
  const modal = document.getElementById("solution-confirmation-modal");
  const modalMessage = document.getElementById("modal-message")!;
  const confirmButton = document.getElementById(
    "modal-confirm"
  ) as HTMLButtonElement;
  const cancelButton = document.getElementById("modal-cancel")!;
  const closeButton = modal?.querySelector(".p-modal__close");

  if (!form || !modal) {
    console.error("ConfirmationModal: Required elements not found");
    return;
  }

  let formSubmitted = false;
  let submitter: HTMLElement | null = null;
  const originalButtonText = confirmButton.textContent;

  const hideSubmitError = () => {
    document.getElementById("solution-submit-error")?.classList.add("u-hide");
  };

  const showSubmitError = (message: string) => {
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

  const submitForm = async () => {
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
          (error as Error).message ||
            "Unable to submit the form. Please try again."
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

  form.addEventListener("submit", (event) => {
    if (formSubmitted) {
      return;
    }

    submitter = (event as SubmitEvent).submitter;
    const shouldValidate = !(submitter as HTMLButtonElement | null)
      ?.formNoValidate;
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

  const closeModal = () => {
    modal.classList.add("u-hide");
    confirmButton.textContent = originalButtonText;
    confirmButton.disabled = false;
  };

  cancelButton.addEventListener("click", closeModal);
  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("u-hide")) {
      closeModal();
    }
  });
}

export default initConfirmationModal;
