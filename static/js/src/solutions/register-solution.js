import initConfirmationModal from "./modules/ConfirmationModal.js";

function getRegistrationMessage(formData) {
  const name = formData.name || "[name not provided]";
  const publisher = formData.publisher || "[publisher not selected]";

  return `Are you sure you want to register the solution "${name}" 
          under the publisher "${publisher}"? 
          This will submit the solution for name review.`;
}

document.addEventListener("DOMContentLoaded", function () {
  initConfirmationModal({
    formSelector: ".p-form",
    getMessage: getRegistrationMessage,
  });

  const nameInput = document.getElementById("name");
  const validationContainer = document.getElementById(
    "solution-name-validation"
  );
  const validationMessage = document.getElementById(
    "solution-name-validation-message"
  );

  const submitButton = document.querySelector('button[type="submit"]');

  if (!nameInput || !validationContainer || !validationMessage) {
    return;
  }

  let validationTimeout = null;

  function showValidationError(message) {
    validationMessage.textContent = message;
    validationContainer.classList.add("is-error");
    nameInput.setAttribute("aria-invalid", "true");
    nameInput.setAttribute(
      "aria-describedby",
      "solution-name-validation-message"
    );

    if (submitButton) {
      submitButton.disabled = true;
    }
  }

  function hideValidationError() {
    validationMessage.textContent = "";
    validationContainer.classList.remove("is-error");
    nameInput.removeAttribute("aria-invalid");
    nameInput.removeAttribute("aria-describedby");

    if (submitButton) {
      submitButton.disabled = false;
    }
  }

  async function validateSolutionName(name) {
    try {
      const response = await fetch(
        `/validate-solution-name?name=${encodeURIComponent(name)}`
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error validating solution name:", error);
      return false;
    }
  }

  nameInput.addEventListener("input", () => {
    const name = nameInput.value.trim();

    clearTimeout(validationTimeout);

    if (name.length === 0) {
      hideValidationError();
      return;
    }

    validationTimeout = setTimeout(async () => {
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
