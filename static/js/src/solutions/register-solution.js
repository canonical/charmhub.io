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
});
