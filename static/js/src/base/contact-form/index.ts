import { setModalReturnURL, setupContactModal } from "./contact-modal";
import { handleSubmitResult } from "./result";
import { captureLanding } from "./tracking";
import { setupValidation } from "./validation";

captureLanding();

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll<HTMLFormElement>(".js-contact-form")
    .forEach((form) => {
      const inModal = form.closest(".js-contact-modal");
      setupValidation(
        form,
        inModal ? () => setModalReturnURL(form) : undefined
      );
    });
  handleSubmitResult();
  setupContactModal();
});
