import { clearAnswers, restoreAnswers } from "./saved-answers";
import {
  clearTracking,
  currentURLWithoutTracking,
  pushEvent,
} from "./tracking";

function trapTabFocus(event: KeyboardEvent, dialog: HTMLElement): void {
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      "a[href], button, input, select, textarea, [tabindex]"
    )
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(":disabled") &&
      element.getClientRects().length > 0
  );
  const index = focusable.findIndex(
    (element) => element === document.activeElement
  );
  if (
    index === -1 ||
    (event.shiftKey && index === 0) ||
    (!event.shiftKey && index === focusable.length - 1)
  ) {
    event.preventDefault();
    const target = event.shiftKey
      ? focusable[focusable.length - 1]
      : focusable[0];
    (target ?? dialog).focus();
  }
}

export function setupContactModal(): void {
  const modal = document.querySelector<HTMLElement>(".js-contact-modal");
  if (!modal) return;

  const dialog = modal.querySelector<HTMLElement>('[role="dialog"]');
  if (!dialog) {
    console.error("Contact modal: dialog element not found");
    return;
  }

  const formPanel = modal.querySelector<HTMLElement>(".js-contact-form-panel");
  const successPanel = modal.querySelector<HTMLElement>(".js-contact-success");
  const errorPanel = modal.querySelector<HTMLElement>(".js-contact-error");
  const form = modal.querySelector<HTMLFormElement>(".js-contact-form");
  const links =
    document.querySelectorAll<HTMLAnchorElement>(".js-contact-link");
  let trigger: HTMLElement | undefined = links[0];

  const open = (panel: "form" | "success" | "error") => {
    if (formPanel) formPanel.hidden = panel === "success";
    if (successPanel) successPanel.hidden = panel !== "success";
    if (errorPanel) errorPanel.hidden = panel !== "error";
    modal.classList.remove("u-hide");
    dialog.focus();
  };

  const close = () => {
    modal.classList.add("u-hide");
    trigger?.focus();
  };

  document.addEventListener("keydown", (event) => {
    if (modal.classList.contains("u-hide")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      trapTabFocus(event, dialog);
    }
  });

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      trigger = link;
      open("form");
      pushEvent("contact_form_opened");
    });
  });

  modal
    .querySelectorAll<HTMLElement>(".js-contact-modal-close")
    .forEach((button) => {
      button.addEventListener("click", close);
    });

  // Runs after validation, which cancels invalid submits
  form?.addEventListener("submit", (event) => {
    if (event.defaultPrevented) return;
    const returnURL = form.elements.namedItem("returnURL");
    if (returnURL instanceof HTMLInputElement) {
      const url = currentURLWithoutTracking();
      url.hash = "contact-form-success";
      returnURL.value = url.href;
    }
  });

  if (window.location.hash === "#contact-form-success") {
    clearAnswers();
    clearTracking();
    open("success");
    pushEvent("contact_form_success");
  } else if (window.location.hash === "#contact-form-fail") {
    if (form) restoreAnswers(form);
    open("error");
    pushEvent("contact_form_failed");
  }
}
