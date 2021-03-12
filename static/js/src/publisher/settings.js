const ALLOWED_KEYS = ["private"];

class SettingsForm {
  constructor(selector, initialState) {
    this.formEl = document.querySelector(selector);

    if (this.formEl) {
      this.validation = {};

      this.initialState = JSON.parse(JSON.stringify(initialState));
      this.currentState = JSON.parse(JSON.stringify(initialState));

      this.init();
    } else {
      throw new Error(`${selector} is not a valid element`);
    }
  }

  init() {
    this.initStickyMenu("[data-js='sticky-menu-observer']");

    // validate inputs on change
    this.formEl.addEventListener("input", (event) => {
      this.updateCurrentState(event.target);
    });
  }

  diffState() {
    const diff = {};

    for (let key of ALLOWED_KEYS) {
      if (this.initialState[key] !== this.currentState[key]) {
        diff[key] = this.currentState[key];
      }
    }

    // only return diff when there are any changes
    return Object.keys(diff).length > 0 ? diff : null;
  }

  updateCurrentState(target) {
    const key = target.getAttribute("name");
    if (key && ALLOWED_KEYS.includes(key)) {
      this.currentState[key] = target.value === "private" ? true : false;
    }

    const diff = this.diffState();

    if (diff) {
      this.stickyEl.classList.remove("u-hide");
    } else {
      this.stickyEl.classList.add("u-hide");
    }
  }

  initStickyMenu(selector) {
    this.observerEl = document.querySelector(selector);

    if (this.observerEl) {
      this.stickyEl = this.observerEl.querySelector("[data-js='sticky-menu']");
      let observer = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio > 0) {
          this.stickyEl.classList.remove("is-sticky");
        } else {
          this.stickyEl.classList.add("is-sticky");
        }
      });

      observer.observe(this.observerEl);
    } else {
      throw new Error(`There is no element containing ${selector} selector.`);
    }
  }
}

function init(initialState) {
  new SettingsForm("#settings-form", initialState);
}

export { init };
