import { clearAnswers, restoreAnswers } from "./saved-answers";
import { clearTracking, pushEvent } from "./tracking";

// Marketo sends the visitor back to returnURL with a result hash
export function handleSubmitResult(): void {
  const { pathname, hash } = window.location;

  if (hash === "#contact-form-fail") {
    // The full-page form returns to /thank-you; refill it on /contact-us
    if (pathname === "/thank-you") {
      window.location.replace("/contact-us#contact-form-fail");
      return;
    }
    document
      .querySelectorAll<HTMLFormElement>(".js-contact-form")
      .forEach(restoreAnswers);
    document
      .querySelectorAll<HTMLElement>(".js-contact-error")
      .forEach((error) => {
        error.hidden = false;
      });
    pushEvent("contact_form_failed");
  } else if (hash === "#contact-form-success" || pathname === "/thank-you") {
    clearAnswers();
    clearTracking();
    if (hash === "#contact-form-success") pushEvent("contact_form_success");
  }
}
