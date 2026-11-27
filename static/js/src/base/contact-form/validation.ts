import { type Field, saveAnswers } from "./saved-answers";
import { fillTrackingFields, pushEvent } from "./tracking";

const FIELDS = "input, select, textarea";

function clearError(wrapper: Element) {
  wrapper.classList.remove("is-error");
  wrapper.querySelector(".js-validation-message")?.remove();
  const field = wrapper.querySelector<Field>(FIELDS);
  field?.removeAttribute("aria-invalid");
  field?.removeAttribute("aria-describedby");
}

function showError(field: Field) {
  const wrapper = field.closest(".p-form-validation");
  if (!wrapper) return;
  wrapper.classList.add("is-error");
  const message = document.createElement("p");
  message.className = "p-form-validation__message js-validation-message";
  message.id = `${field.id || field.name}-error`;
  message.textContent = field.validationMessage;
  wrapper.appendChild(message);
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", message.id);
}

function showSending(button: HTMLButtonElement) {
  button.disabled = true;
  const spinner = document.createElement("i");
  spinner.className = "p-icon--spinner u-animation--spin is-light";
  button.replaceChildren(spinner, " Submitting…");
}

function showReady(button: HTMLButtonElement, label: string) {
  button.disabled = false;
  button.textContent = label;
}

export function setupValidation(
  form: HTMLFormElement,
  beforeSend?: () => void
): void {
  // Show our own messages instead of the browser's bubbles
  form.noValidate = true;

  const sending = new Map<HTMLButtonElement, string>();

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

    beforeSend?.();
    pushEvent("contact_form_submitted");
    fillTrackingFields(form);
    saveAnswers(form);
    form
      .querySelectorAll<HTMLButtonElement>('[type="submit"]')
      .forEach((button) => {
        if (!sending.has(button)) {
          sending.set(button, button.textContent || "");
        }
        showSending(button);
      });
  });

  // Back can restore the page exactly as it was left, mid-send
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    sending.forEach((label, button) => showReady(button, label));
    sending.clear();
  });
}
