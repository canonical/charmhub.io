/**
  Toggles visibility of modal dialog.
  @param {HTMLElement} modal Modal dialog to show or hide.
*/
export function toggleModal(modal) {
  if (modal && modal.classList.contains("p-tooltip__modal")) {
    if (modal.style.display === "none") {
      modal.style.display = "flex";
    } else {
      modal.style.display = "none";
    }
  }
}

// Add click handler for clicks on elements with aria-controls
document.addEventListener("click", function (event) {
  const targetControls = event.target.getAttribute("aria-controls");
  if (targetControls) {
    toggleModal(document.getElementById(targetControls));
  }
});
