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

export { initTooltips, initMultiselect, initLicenses };
