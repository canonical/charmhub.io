import declareGlobal from "../../../libs/declare";

const COPIED_TIMEOUT = 2000;

function handleCopy() {
  document.addEventListener("click", async (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-js='copy']"
    );

    if (!button || !navigator.clipboard) {
      return;
    }

    const text = button.dataset.copy;
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    const icon = button.querySelector("i");
    const originalLabel = button.getAttribute("aria-label") || "";

    if (icon) {
      icon.className = "p-icon--success";
    }
    button.setAttribute("aria-label", "Copied");
    button.title = "Copied";

    window.setTimeout(() => {
      if (icon) {
        icon.className = "p-icon--copy";
      }
      button.setAttribute("aria-label", originalLabel);
      button.title = originalLabel;
    }, COPIED_TIMEOUT);
  });
}

// Pagination of the release history is handled by React (see revisions.tsx).
function init() {
  handleCopy();
}

export { init };

declareGlobal("charmhub.resources", { init });
