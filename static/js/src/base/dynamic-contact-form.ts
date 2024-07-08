(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const triggeringHash = "#get-in-touch";
    const formContainer = document.getElementById("contact-form-container") as HTMLElement;
    const contactButtons = document.querySelectorAll<HTMLElement>(".js-invoke-modal");

    contactButtons.forEach((contactButton: HTMLElement) => {
      contactButton.addEventListener("click", function (e: MouseEvent) {
        e.preventDefault();
        if (contactButton.dataset.formLocation) {
          fetchForm(contactButton.dataset, contactButton);
        } else {
          fetchForm(formContainer.dataset, contactButton);
        }
        open();
      });
    });

    // Fetch, load and initialise form
    function fetchForm(formData: DOMStringMap, contactButton?: HTMLElement) {
      fetch(formData.formLocation!)
        .then(response => response.text())
        .then(text => {
          formContainer.classList.remove("u-hide");
          formContainer.innerHTML = text
            .replace(/%% formid %%/g, formData.formId!)
            .replace(/%% lpId %%/g, formData.lpId!)
            .replace(/%% returnURL %%/g, formData.returnUrl!)
            .replace(/%% lpurl %%/g, formData.lpUrl!);
          setProductContext(contactButton);
          initialiseForm();
        })
        .catch((error) => {
          console.log("Request failed", error);
        });
    }

    // Open the contact us modal
    function open() {
      updateHash(triggeringHash);
      // @ts-ignore
      ga(
        "send",
        "event",
        "interactive-forms",
        "open",
        window.location.pathname
      );
    }

    // Removes the triggering hash
    function updateHash(hash: string) {
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

    function setProductContext(contactButton?: HTMLElement) {
      // Capture current path and stringify
      // eg. /kubernetes/install -> kubernetes-install
      // fallbacks to "global"
      let product =
        window.location.pathname.split("/").slice(1).join("-") || "global";
      // If present, override with product parameter from button URL
      if (contactButton) {
        const params = (contactButton as HTMLAnchorElement).search.split("&");
        params.forEach((param: string) => {
          if (param.startsWith("product") || param.startsWith("?product")) {
            product = param.split("=")[1];
          }
        });
      }

      // Set product in form field
      const productContext = document.getElementById("product-context") as HTMLInputElement;
      if (productContext) {
        productContext.value = product;
      }
    }

    function initialiseForm() {
      let contactIndex = 1;
      const contactModal = document.getElementById("contact-modal") as HTMLElement;
      const closeModal = document.querySelector(".p-modal__close") as HTMLElement | null;
      const closeModalButton = document.querySelector(".js-close")  as HTMLElement | null;
      const modalPaginationButtons =
        contactModal.querySelectorAll(".pagination a");
      const paginationContent = contactModal.querySelectorAll<HTMLElement>(".js-pagination");
      const submitButton = contactModal.querySelector(".mktoButton") as HTMLElement | null;
      const comment = contactModal.querySelector("#Comments_from_lead__c") as HTMLInputElement | null;
      const otherContainers = document.querySelectorAll<HTMLElement>(".js-other-container");

      document.onkeydown = function (evt) {
        evt = evt || window.event;
        if (evt.key === "Escape") {
          close();
        }
      };

      if (submitButton) {
        submitButton.addEventListener("click", () => {
          // @ts-ignore
          ga(
            "send",
            "event",
            "interactive-forms",
            "submitted",
            window.location.pathname
          );
        });
      }

      if (closeModal) {
        closeModal.addEventListener("click", (e) => {
          e.preventDefault();
          close();
        });
      }

      if (closeModalButton) {
        closeModalButton.addEventListener("click", (e) => {
          e.preventDefault();
          close();
        });
      }

      if (contactModal) {
        contactModal.addEventListener("click", (e) => {
          if ((e.target as HTMLElement).id == "contact-modal") {
            e.preventDefault();
            close();
          }
        });
      }

      modalPaginationButtons?.forEach((modalPaginationButton) => {
        modalPaginationButton.addEventListener("click", (e) => {
          e.preventDefault();
          const button = (e.target as HTMLElement).closest("a") as HTMLElement;
          let index = contactIndex;
          if (button.classList.contains("pagination__link--previous")) {
            index = index - 1;
          } else {
            index = index + 1;
          }
          setState(index);
          // @ts-ignore
          ga(
            "send",
            "event",
            "interactive-forms",
            "goto:" + index,
            window.location.pathname
          );
        });
      });

      otherContainers.forEach((otherContainer) => {
        const checkbox = otherContainer.querySelector<HTMLInputElement>(
          ".js-other-container__checkbox"
        )!;
        const input = otherContainer.querySelector<HTMLElement>(".js-other-container__input")!;
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

      // Hack for now but updates the styling based on the thank you panel
      function checkThankYou() {
        if (contactIndex == 4) {
          contactModal.classList.add("thank-you");
        } else {
          contactModal.classList.remove("thank-you");
        }
      }

      // Updates the index and renders the changes
      function setState(index: number) {
        contactIndex = index;
        render();
      }

      // Close the modal and set the index back to the first stage
      function close() {
        setState(1);
        formContainer.classList.add("u-hide");
        formContainer.removeChild(contactModal!);
        updateHash("");
        // @ts-ignore
        ga(
          "send",
          "event",
          "interactive-forms",
          "close",
          window.location.pathname
        );
      }

      // Update the content of the modal based on the current index
      function render() {
        checkThankYou();

        if (comment) {
          comment.value = createMessage();
        }

        const currentContent = contactModal?.querySelector(
          ".js-pagination--" + contactIndex
        ) as HTMLElement;
        paginationContent?.forEach((content) => {
          content.classList.add("u-hide");
        });
        currentContent.classList.remove("u-hide");
      }

      // Concatinate the options selected into a string
      function createMessage() {
        let message = "";

        const formFields = contactModal.querySelectorAll<HTMLElement>(".js-formfield");
        formFields?.forEach((formField) => {
          let comma = "";
          const fieldTitle = formField.querySelector(".p-heading--5") as HTMLElement;
          const inputs = formField.querySelectorAll<HTMLInputElement>("input, textarea");
          
          
          if (fieldTitle) {
            message += fieldTitle.innerText + "\r\n";
          }

          inputs.forEach((input) => {
            switch (input.type) {
              case "radio":
                if (input.checked) {
                  message += comma + input.value;
                  comma = ", ";
                }
                break;
              case "checkbox":
                if (input.checked) {
                  let subSectionText = "";
                  let subSection = input
                    .closest('[class*="col-"]')
                    ?.querySelector<HTMLElement>(".js-sub-section");
                  if (subSection) {
                    subSectionText = subSection.innerText + ": ";
                  }

                  const label = formField.querySelector<HTMLLabelElement>(
                    `label[for=${input.id}]`
                  );
                  if (label) {
                    message += comma + subSectionText + label.innerText;
                    comma = ", ";
                  }
                }
                break;
              case "text":
                if (
                  !input.classList.contains("mktoField") &&
                  input.value !== ""
                ) {
                  message += comma + input.value;
                  comma = ", ";
                }
                break;
              case "textarea":
                if (
                  !input.classList.contains("mktoField") &&
                  input.value !== ""
                ) {
                  message += comma + input.value;
                  comma = ", ";
                }
                break;
            }
          });
          message += "\r\n\r\n";
        });

        return message;
      }
    }

    // Opens the form when the initial hash matches the trigger
    if (window.location.hash === triggeringHash) {
      fetchForm(formContainer.dataset);
      open();
    }

    // Listens for hash changes and opens the form if it matches the trigger
    function locationHashChanged() {
      if (window.location.hash === triggeringHash) {
        fetchForm(formContainer.dataset);
        open();
      }
    }
    window.onhashchange = locationHashChanged;
  });
})();
