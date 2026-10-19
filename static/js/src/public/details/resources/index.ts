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

function handleShowMoreRevisions() {
  document
    .querySelectorAll<HTMLButtonElement>(".js-show-more-revisions")
    .forEach((button) => {
      // Each resource section manages its own revisions
      const scope: ParentNode = button.closest(".js-resource") || document;
      const count = scope.querySelector<HTMLElement>(".js-revisions-count");

      if (!count) {
        return;
      }

      const limit = Number(button.dataset.limit) || 10;

      button.addEventListener("click", () => {
        const hiddenRows = scope.querySelectorAll(".js-revision-row.u-hide");
        Array.from(hiddenRows)
          .slice(0, limit)
          .forEach((row) => row.classList.remove("u-hide"));

        const visible = scope.querySelectorAll(
          ".js-revision-row:not(.u-hide)"
        ).length;
        count.textContent = String(visible);

        const remaining = hiddenRows.length - limit;
        if (remaining > 0) {
          button.textContent = `Show ${Math.min(remaining, limit)} more`;
        } else {
          button.remove();
        }
      });
    });
}

function init() {
  handleCopy();
  handleShowMoreRevisions();
}

export { init };

declareGlobal("charmhub.resources", { init });
