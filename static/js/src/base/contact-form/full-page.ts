import { clearAnswers, restoreAnswers } from "./saved-answers";
import { clearTracking, pushEvent } from "./tracking";

export function setupFullPageResult(): void {
  const { pathname, hash } = window.location;

  if (pathname === "/thank-you") {
    if (hash === "#contact-form-fail") {
      window.location.replace("/contact-us#contact-form-fail");
      return;
    }
    if (hash === "#contact-form-success") {
      pushEvent("contact_form_success");
    }
    clearAnswers();
    clearTracking();
  }

  if (pathname === "/contact-us" && hash === "#contact-form-fail") {
    const form = document.querySelector<HTMLFormElement>(".js-contact-form");
    if (form) restoreAnswers(form);
    const error = document.querySelector<HTMLElement>(".js-contact-error");
    if (error) error.hidden = false;
    pushEvent("contact_form_failed");
  }
}
