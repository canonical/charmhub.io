import initConfirmationModal from "./modules/ConfirmationModal.js";

type ConfirmationFormData = Record<string, FormDataEntryValue>;

type ValidateSolutionNameResponse = {
  exists?: boolean;
};

function getRegistrationMessage(formData: ConfirmationFormData): string {
  const name = String(formData.name || "[name not provided]");
  const publisher = String(formData.publisher || "[publisher not selected]");

  return `Are you sure you want to register the solution "${name}" 
          under the publisher "${publisher}"? 
          This will submit the solution for name review.`;
}

document.addEventListener("DOMContentLoaded", function () {
  initConfirmationModal({
    formSelector: ".p-form",
    getMessage: getRegistrationMessage,
  });

  const nameInput = document.getElementById("name") as HTMLInputElement | null;
  const validationContainer = document.getElementById(
    "solution-name-validation"
  );
  const validationMessage = document.getElementById(
    "solution-name-validation-message"
  );

  const submitButton = document.querySelector(
    'button[type="submit"]'
  ) as HTMLButtonElement | null;

  if (!nameInput || !validationContainer || !validationMessage) {
    return;
  }

  const nameInputElement = nameInput;
  const validationContainerElement = validationContainer;
  const validationMessageElement = validationMessage;

  let validationTimeout: number | undefined;

  function showValidationError(message: string): void {
    validationMessageElement.textContent = message;
    validationContainerElement.classList.add("is-error");
    nameInputElement.setAttribute("aria-invalid", "true");
    nameInputElement.setAttribute(
      "aria-describedby",
      "solution-name-validation-message"
    );

    if (submitButton) {
      submitButton.disabled = true;
    }
  }

  function hideValidationError(): void {
    validationMessageElement.textContent = "";
    validationContainerElement.classList.remove("is-error");
    nameInputElement.removeAttribute("aria-invalid");
    nameInputElement.removeAttribute("aria-describedby");

    if (submitButton) {
      submitButton.disabled = false;
    }
  }

  async function validateSolutionName(name: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/validate-solution-name?name=${encodeURIComponent(name)}`
      );
      const data = (await response.json()) as ValidateSolutionNameResponse;
      return Boolean(data.exists);
    } catch (error) {
      console.error("Error validating solution name:", error);
      return false;
    }
  }

  nameInputElement.addEventListener("input", () => {
    const name = nameInputElement.value.trim();

    window.clearTimeout(validationTimeout);

    if (name.length === 0) {
      hideValidationError();
      return;
    }

    validationTimeout = window.setTimeout(async () => {
      const exists = await validateSolutionName(name);

      if (exists) {
        showValidationError(
          `A solution with the name "${name}" already exists. Please choose a different name.`
        );
      } else {
        hideValidationError();
      }
    }, 500);
  });
});
