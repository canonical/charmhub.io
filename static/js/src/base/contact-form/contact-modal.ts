import { currentURLWithoutTracking, pushEvent } from "./tracking";

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

// Marketo sends the visitor back to the page the pop-up was opened on
export function setModalReturnURL(form: HTMLFormElement): void {
  const returnURL = form.elements.namedItem("returnURL");
  if (returnURL instanceof HTMLInputElement) {
    const url = currentURLWithoutTracking();
    url.hash = "contact-form-success";
    returnURL.value = url.href;
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
  const links =
    document.querySelectorAll<HTMLAnchorElement>(".js-contact-link");
  let trigger: HTMLElement | undefined = links[0];

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      trapTabFocus(event, dialog);
    }
  };

  const open = (success = false) => {
    if (formPanel) formPanel.hidden = success;
    if (successPanel) successPanel.hidden = !success;
    modal.classList.remove("u-hide");
    document.addEventListener("keydown", onKeydown);
    dialog.focus();
  };

  const close = () => {
    modal.classList.add("u-hide");
    document.removeEventListener("keydown", onKeydown);
    trigger?.focus();
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      trigger = link;
      open();
      pushEvent("contact_form_opened");
    });
  });

  modal
    .querySelectorAll<HTMLElement>(".js-contact-modal-close")
    .forEach((button) => {
      button.addEventListener("click", close);
    });

  // Storage and analytics for the result are handled in result.ts
  if (window.location.hash === "#contact-form-success") {
    open(true);
  } else if (window.location.hash === "#contact-form-fail") {
    open();
  }
}
