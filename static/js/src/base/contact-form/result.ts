import { clearAnswers, restoreAnswers } from "./saved-answers";
import { clearTracking, pushEvent } from "./tracking";

export const SUCCESS = "#contact-form-success";
export const FAIL = "#contact-form-fail";

// Marketo sends the visitor back to returnURL with a result hash.
// Returns true when the visitor is being sent on to another page.
export function handleSubmitResult(): boolean {
  const { pathname, hash } = window.location;

  if (hash === FAIL) {
    // The full-page form returns to /thank-you; refill it on /contact-us
    if (pathname === "/thank-you") {
      window.location.replace(`/contact-us${FAIL}`);
      return true;
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
  } else if (hash === SUCCESS || pathname === "/thank-you") {
    clearAnswers();
    clearTracking();
    if (hash === SUCCESS) pushEvent("contact_form_success");
  }
  return false;
}

// Drop the result hash so a refresh or shared link does not repeat the result
export function clearResultHash(): void {
  const { pathname, search, hash } = window.location;
  if (hash === SUCCESS || hash === FAIL) {
    window.history.replaceState(window.history.state, "", pathname + search);
  }
}
