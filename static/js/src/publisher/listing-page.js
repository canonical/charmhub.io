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

export { initTooltips, initMultiselect };
