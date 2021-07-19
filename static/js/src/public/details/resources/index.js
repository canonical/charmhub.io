function handleTogglePanels() {
  const panelToggleButtons = document.querySelectorAll(".js-panel-toggle");

  panelToggleButtons.forEach((panelToggleButton) => {
    panelToggleButton.addEventListener("click", (e) => {
      const target = e.target;
      const panel = document.getElementById(
        target.getAttribute("aria-controls")
      );

      target.classList.toggle("is-active");
      panel.classList.toggle("is-open");

      if (panel.classList.contains("is-open")) {
        panel.querySelector("[readonly]").focus();
        panel.setAttribute("role", "dialog");
      } else {
        panel.removeAttribute("role");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    const escKeyCode = 27;
    const tabKeyCode = 9;

    const openPanelToggle = document.querySelector(
      ".js-panel-toggle.is-active"
    );

    const openPanel = document.querySelector("[readonly]");

    if (e.keyCode === escKeyCode || e.keyCode === tabKeyCode) {
      if (openPanelToggle) {
        openPanelToggle.focus();
        openPanelToggle.classList.remove("is-active");
      }

      if (openPanel) {
        openPanel.parentElement.classList.remove("is-open");
      }
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    const openPanelToggle = document.querySelector(
      ".js-panel-toggle.is-active"
    );
    const openPanel = document.querySelector(".p-inline-list__panel.is-open");
    const openPanelInput = document.querySelector("[readonly]");

    if (openPanel) {
      if (target !== openPanelToggle && target !== openPanelInput) {
        openPanelToggle.classList.remove("is-active");
        openPanel.classList.remove("is-open");
        openPanel.removeAttribute("role");
      }
    }
  });
}

function init() {
  handleTogglePanels();
}

export { init };
