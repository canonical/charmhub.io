import { clearAnswers, restoreAnswers } from "./saved-answers";
import { clearTracking, pushEvent } from "./tracking";

export function setupFullPageResult(): void {
  const { pathname, hash } = window.location;

  if (pathname === "/thank-you") {
    if (hash === "#contact-form-fail") {
      window.location.replace("/contact-us/error#contact-form-fail");
      return;
    }
    if (hash === "#contact-form-success") {
      pushEvent("contact_form_success");
    }
    clearAnswers();
    clearTracking();
  }

  if (pathname === "/contact-us/error" && hash === "#contact-form-fail") {
    pushEvent("contact_form_failed");
  }

  if (pathname === "/contact-us") {
    const form = document.querySelector<HTMLFormElement>(".js-contact-form");
    if (form) restoreAnswers(form);
  }
}
