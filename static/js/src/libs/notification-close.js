export default function initCloseButton() {
  /**
  Attaches event listener for hide notification on close button click.
  @param {HTMLElement} closeButton The notification close button element.
*/
  function setupCloseButton(closeButton) {
    closeButton.addEventListener("click", function (event) {
      var target = event.target.getAttribute("aria-controls");
      var notification = document.getElementById(target);

      if (notification) {
        notification.classList.add("u-hide");
      }
    });
  }

  // Set up all notification close buttons.
  var closeButtons = document.querySelectorAll(
    ".p-notification [aria-controls]"
  );

  for (var i = 0, l = closeButtons.length; i < l; i++) {
    setupCloseButton(closeButtons[i]);
  }
}
