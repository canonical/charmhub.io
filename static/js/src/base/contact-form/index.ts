import { setupContactModal } from "./contact-modal";
import { setupFullPageResult } from "./full-page";
import { captureLanding } from "./tracking";
import { setupValidation } from "./validation";

captureLanding();

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll<HTMLFormElement>(".js-contact-form")
    .forEach((form) => {
      setupValidation(form);
    });
  setupFullPageResult();
  setupContactModal();
});
