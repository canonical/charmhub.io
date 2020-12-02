import { initMultiselect } from "./components/multiselect";

function toggleModal(modal) {
  if (
    modal &&
    modal.classList.contains("p-tooltip__modal") &&
    window.innerWidth < 772
  ) {
    modal.classList.toggle("is-open");
  }
}

function initTooltips() {
  document.addEventListener("click", function (event) {
    var targetControls = event.target.getAttribute("aria-controls");
    if (targetControls) {
      toggleModal(document.getElementById(targetControls));
    }
  });

  return this;
}

function initStickyMenu(selector) {
  const observerEl = document.querySelector(selector);

  if (observerEl) {
    const stickyEl = observerEl.querySelector("[data-js='sticky-menu']");
    let observer = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio > 0) {
        stickyEl.classList.remove("is-sticky");
      } else {
        stickyEl.classList.add("is-sticky");
      }
    });

    observer.observe(observerEl);
  } else {
    throw new Error(`There is no element containing ${selector} selector.`);
  }
}

function initLicenses(inputs) {
  function licenseTypeChange() {
    var type = this.value;
    inputs.forEach((item) => {
      if (item.id.includes(type)) {
        item.classList.remove("u-hide");
      } else {
        item.classList.add("u-hide");
      }
    });
  }

  var licenseRadio = document.querySelectorAll('[name="license-type"]');
  if (licenseRadio) {
    for (var i = 0; i < licenseRadio.length; i++) {
      licenseRadio[i].addEventListener("change", licenseTypeChange);
    }
  }
}

export { initTooltips, initMultiselect, initLicenses, initStickyMenu };
