const TRIGGERING_HASH = "#get-in-touch";

// Function to initialize the contact form
export async function initialiseContactForm() {
  const formContainer = document.getElementById(
    "contact-form-container"
  ) as HTMLElement;
  const contactButtons =
    document.querySelectorAll<HTMLAnchorElement>(".js-invoke-modal");

  contactButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      await fetchForm(button.dataset, button);
      open();
    });
  });

  if (window.location.hash === TRIGGERING_HASH) {
    await fetchForm(formContainer.dataset);
    open();
  }

  window.onhashchange = async () => {
    if (window.location.hash === TRIGGERING_HASH) {
      await fetchForm(formContainer.dataset);
      open();
    }
  };
}

// Fetch, load and initialise form
export async function fetchForm(
  formData: DOMStringMap,
  contactButton?: HTMLAnchorElement | undefined
) {
  try {
    const response = await fetch(formData.formLocation!);
    const text = await response.text();
    const formContainer = document.getElementById(
      "contact-form-container"
    ) as HTMLElement;
    formContainer.classList.remove("u-hide");
    formContainer.innerHTML = text
      .replace(/%% formid %%/g, formData.formId!)
      .replace(/%% lpId %%/g, formData.lpId!)
      .replace(/%% returnURL %%/g, formData.returnUrl!)
      .replace(/%% lpurl %%/g, formData.lpUrl!);
    setProductContext(contactButton);
    initialiseForm();
  } catch (error) {
    console.log("Request failed", error);
  }
}

// Open the contact us modal
export function open() {
  updateHash(TRIGGERING_HASH);
  // @ts-expect-error: ga is defined globally
  ga("send", "event", "interactive-forms", "open", window.location.pathname);
}

// Removes the triggering hash
export function updateHash(hash: string) {
  const location = window.location;
  if (location.hash !== hash || hash === "") {
    if ("pushState" in history) {
      history.pushState(
        "",
        document.title,
        location.pathname + location.search + hash
      );
    } else {
      location.hash = hash;
    }
  }
}

export function setProductContext(
  contactButton?: HTMLAnchorElement | undefined
) {
  const product = contactButton
    ? new URL(contactButton.href).searchParams.get("product") ||
      window.location.pathname.split("/").slice(1).join("-") ||
      "global"
    : window.location.pathname.split("/").slice(1).join("-") || "global";
  const productContext = document.getElementById(
    "product-context"
  ) as HTMLInputElement;
  if (productContext) productContext.value = product;
}

export function initialiseForm() {
  let contactIndex = 1;
  const contactModal = document.getElementById("contact-modal") as HTMLElement;
  const closeModal = document.querySelector(
    ".p-modal__close"
  ) as HTMLElement | null;
  const closeModalButton = document.querySelector(
    ".js-close"
  ) as HTMLElement | null;
  const modalPaginationButtons = contactModal.querySelectorAll(".pagination a");
  const paginationContent =
    contactModal.querySelectorAll<HTMLElement>(".js-pagination");
  const submitButton = contactModal.querySelector(
    ".mktoButton"
  ) as HTMLElement | null;
  const comment = contactModal.querySelector(
    "#Comments_from_lead__c"
  ) as HTMLInputElement | null;
  const otherContainers = document.querySelectorAll<HTMLElement>(
    ".js-other-container"
  );

  document.onkeydown = (evt) => {
    if (evt.key === "Escape") {
      close();
    }
  };

  submitButton?.addEventListener("click", () => {
    // @ts-expect-error: ga is defined globally
    ga(
      "send",
      "event",
      "interactive-forms",
      "submitted",
      window.location.pathname
    );
  });

  closeModal?.addEventListener("click", (e) => {
    e.preventDefault();
    close();
  });

  closeModalButton?.addEventListener("click", (e) => {
    e.preventDefault();
    close();
  });

  contactModal?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id == "contact-modal") {
      e.preventDefault();
      close();
    }
  });

  modalPaginationButtons?.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      contactIndex += button.classList.contains("pagination__link--previous")
        ? -1
        : 1;
      setState(contactIndex);
      // @ts-expect-error: ga is defined globally
      ga(
        "send",
        "event",
        "interactive-forms",
        "goto:" + contactIndex,
        window.location.pathname
      );
    });
  });

  otherContainers.forEach((container) => {
    const checkbox = container.querySelector<HTMLInputElement>(
      ".js-other-container__checkbox"
    )!;
    const input = container.querySelector<HTMLElement>(
      ".js-other-container__input"
    )!;
    checkbox.addEventListener("change", (e) => {
      if ((e.target as HTMLInputElement).checked) {
        input.classList.remove("u-hide");
        input.focus();
      } else {
        input.classList.add("u-hide");
        (input as HTMLInputElement).value = "";
      }
    });
  });

  function checkThankYou() {
    contactModal.classList.toggle("thank-you", contactIndex === 4);
  }

  function setState(index: number) {
    contactIndex = index;
    render();
  }

  function close() {
    setState(1);
    const formContainer = document.getElementById(
      "contact-form-container"
    ) as HTMLElement;
    formContainer.classList.add("u-hide");
    formContainer.removeChild(contactModal!);
    updateHash("");
    // @ts-expect-error: ga is defined globally
    ga("send", "event", "interactive-forms", "close", window.location.pathname);
  }

  function render() {
    checkThankYou();
    if (comment) comment.value = createMessage();
    paginationContent.forEach((content) => content.classList.add("u-hide"));
    const currentContent = contactModal?.querySelector(
      ".js-pagination--" + contactIndex
    ) as HTMLElement;
    currentContent.classList.remove("u-hide");
  }

  function createMessage() {
    let message = "";
    const formFields =
      contactModal.querySelectorAll<HTMLElement>(".js-formfield");
    formFields.forEach((field) => {
      const fieldTitle = field.querySelector(".p-heading--5") as HTMLElement;
      const inputs =
        field.querySelectorAll<HTMLInputElement>("input, textarea");
      if (fieldTitle) message += fieldTitle.innerText + "\r\n";
      inputs.forEach((input) => {
        switch (input.type) {
          case "radio":
            if (input.checked) message += ", " + input.value;
            break;
          case "checkbox":
            if (input.checked) {
              const subSection = input
                .closest('[class*="col-"]')
                ?.querySelector(".js-sub-section");
              const label = field.querySelector<HTMLLabelElement>(
                `label[for=${input.id}]`
              );
              if (label)
                message +=
                  ", " +
                  (subSection?.textContent + ": " || "") +
                  label.textContent;
            }
            break;
          case "text":
          case "textarea":
            if (!input.classList.contains("mktoField") && input.value)
              message += ", " + input.value;
            break;
        }
      });
      message += "\r\n\r\n";
    });
    return message;
  }
}

// Initialize contact form when DOM is ready
document.addEventListener("DOMContentLoaded", initialiseContactForm);
