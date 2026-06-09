function initConfirmationModal(config) {
  const form = document.querySelector(config.formSelector);
  const modal = document.getElementById("solution-confirmation-modal");
  const modalMessage = document.getElementById("modal-message");
  const confirmButton = document.getElementById("modal-confirm");
  const cancelButton = document.getElementById("modal-cancel");
  const closeButton = modal?.querySelector(".p-modal__close");

  if (!form || !modal) {
    console.error("ConfirmationModal: Required elements not found");
    return;
  }

  let formSubmitted = false;
  let submitter = null;

  const submitForm = () => {
    formSubmitted = true;

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

    submitter = event.submitter;

    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (window.validateSolutionForm && !window.validateSolutionForm()) {
      return;
    }

    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    const message = config.getMessage(formObject, form);

    if (!message) {
      submitForm();
      return;
    }

    modalMessage.textContent = message;
    modal.classList.remove("u-hide");
    confirmButton.focus();
  });

  const originalButtonText = confirmButton.textContent;

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
