import deepCopy from "deep-copy";
import deepEqual from "deep-equal";

// https://gist.github.com/dperini/729294
// Luke 07-06-2018 made the protocol optional
const URL_REGEXP = /^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
// Luke 07-06-2018 rather then looking for a mailto, look for 1 @ and at least 1 .
const MAILTO_REGEXP = /[^@]+@[^@]+\.[^@]+/;
const ALLOWED_KEYS = ["title", "summary", "website", "contact"];

class ListingForm {
  constructor(selector, initialState) {
    this.formEl = document.querySelector(selector);

    if (this.formEl) {
      this.validation = {};
      this.prefixableFields = ["contact"];
      this.allInputs = Array.from(
        this.formEl.querySelectorAll("input,textarea")
      );

      this.initialState = JSON.parse(JSON.stringify(initialState));
      this.currentState = JSON.parse(JSON.stringify(initialState));

      this.init();
    } else {
      throw new Error(`${selector} is not a valid element`);
    }
  }

  init() {
    this.allInputs.forEach((input) => {
      const inputValidation = { isValid: true };

      if (input.maxLength > 0) {
        // save max length, but remove it from input so more chars can be entered
        inputValidation.maxLength = input.maxLength;

        // prepare counter element to show how many chars need to be removed
        const counter = document.createElement("p");
        counter.className = "p-form-help-text";
        inputValidation.counterEl = counter;
        input.parentNode.appendChild(counter);
      }

      if (input.required) {
        inputValidation.required = true;
      }

      if (input.type === "url") {
        inputValidation.url = true;
      }

      // allow mailto: addresses for contact field
      if (input.name === "contact") {
        inputValidation.mailto = true;
      }

      this.validation[input.name] = inputValidation;
    }, this);

    // validate inputs on change
    this.formEl.addEventListener("input", (event) => {
      this.validateInput(event.target);
      this.updateCurrentState(event.target);
    });

    this.prefixableFields.forEach((inputName) => {
      const input = this.formEl[inputName];
      if (input) {
        input.addEventListener("blur", (event) => {
          this.prefixInput(event.target);
          this.updateCurrentState(event.target);
        });
      }
    }, this);
  }

  diffState() {
    const diff = deepCopy(this.initialState);

    for (let key of ALLOWED_KEYS) {
      diff[key] = this.initialState[key];
    }

    for (let key of ALLOWED_KEYS) {
      if (this.prefixableFields.includes(key)) {
        if (
          this.initialState[key] !== this.currentState[key] &&
          this.initialState[key] !== `mailto:${this.currentState[key]}`
        ) {
          diff[key] = this.currentState[key];
        }
      } else {
        if (this.initialState[key] !== this.currentState[key]) {
          console.log("hello");
          diff[key] = this.currentState[key];
        }
      }
    }

    // only return diff when there are any changes
    return !deepEqual(diff, this.initialState);
  }

  updateCurrentState(target) {
    const key = target.getAttribute("id");
    if (key && ALLOWED_KEYS.includes(key)) {
      this.currentState[key] = target.value || null;
    }

    const diff = this.diffState();
    const actionButtons = document.querySelectorAll(".js-action-button");

    actionButtons.forEach((button) => {
      if (diff) {
        button.disabled = false;
        button.classList.remove("is-disabled");
      } else {
        button.disabled = true;
        button.classList.add("is-disabled");
      }
    });
  }

  // Prefix field field on blur if the user doesn't provide the protocol
  prefixInput(input) {
    if (["website", "contact"].includes(input.name)) {
      if (
        this.validation[input.name].isValid &&
        input.value.length > 0 &&
        !input.value.includes("http") &&
        !input.value.includes("mailto")
      ) {
        if (input.name === "website") {
          input.value = `https://${input.value}`;
        } else if (
          input.name === "contact" &&
          MAILTO_REGEXP.test(input.value)
        ) {
          input.value = `mailto:${input.value}`;
        }
        this.validateInput(input);
      }
    }
  }

  validateInput(input) {
    const field = input.closest(".p-form-validation");

    if (field) {
      const message = field.querySelector(".p-form-validation__message");
      if (message) {
        message.remove();
      }

      let isValid = true;

      const inputValidation = this.validation[input.name];

      if (inputValidation.required) {
        const length = input.value.length;
        if (!length) {
          isValid = false;
        }
      }

      if (inputValidation.maxLength) {
        if (this.validation[input.name].maxLength === input.value.length) {
          inputValidation.counterEl.innerHTML = `The maximum number of characters for this field is ${
            this.validation[input.name].maxLength
          }.`;
        } else {
          inputValidation.counterEl.innerHTML = "";
        }
      }

      // only validate contents when there is any value
      if (input.value.length > 0) {
        if (inputValidation.mailto) {
          if (
            !URL_REGEXP.test(input.value) &&
            !MAILTO_REGEXP.test(input.value)
          ) {
            isValid = false;
          }
        } else if (inputValidation.url) {
          if (!URL_REGEXP.test(input.value)) {
            isValid = false;
          }
        }
      }

      if (isValid) {
        field.classList.remove("is-error");
        inputValidation.isValid = true;
      } else {
        field.classList.add("is-error");
        inputValidation.isValid = false;
      }
    }
  }

  isFormValid() {
    // form is valid if every validated input is valid
    return Object.keys(this.validation)
      .every((name) => this.validation[name].isValid)
      .bind(this);
  }
}

function init(initialState) {
  new ListingForm("#market-form", initialState);
}

export { init };
