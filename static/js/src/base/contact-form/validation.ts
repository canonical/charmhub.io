import { saveAnswers } from "./saved-answers";
import { fillTrackingFields, pushEvent } from "./tracking";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const FIELDS = "input, select, textarea";

function clearError(wrapper: Element) {
  wrapper.classList.remove("is-error");
  wrapper.querySelector(".js-validation-message")?.remove();
}

function showError(field: Field) {
  const wrapper = field.closest(".p-form-validation");
  if (!wrapper) return;
  wrapper.classList.add("is-error");
  const message = document.createElement("p");
  message.className = "p-form-validation__message js-validation-message";
  message.textContent = field.validationMessage;
  wrapper.appendChild(message);
}

export function setupValidation(form: HTMLFormElement): void {
  // Show our own messages instead of the browser's bubbles
  form.noValidate = true;

  const errorWrappers = () =>
    form.querySelectorAll(".p-form-validation.is-error");

  const clearFixedErrors = () => {
    errorWrappers().forEach((wrapper) => {
      const field = wrapper.querySelector<Field>(FIELDS);
      if (field && (field.disabled || field.validity.valid)) {
        clearError(wrapper);
      }
    });
  };
  form.addEventListener("input", clearFixedErrors);
  form.addEventListener("change", clearFixedErrors);

  form.addEventListener("submit", (event) => {
    errorWrappers().forEach(clearError);

    if (!form.checkValidity()) {
      event.preventDefault();
      const invalid = Array.from(form.querySelectorAll<Field>(FIELDS)).filter(
        (field) => !field.disabled && !field.validity.valid
      );
      invalid.forEach(showError);
      invalid[0]?.focus();
      return;
    }

    pushEvent("contact_form_submitted");
    fillTrackingFields(form);
    saveAnswers(form);
    form
      .querySelectorAll<HTMLButtonElement>('[type="submit"]')
      .forEach((button) => {
        button.disabled = true;
      });
  });
}
