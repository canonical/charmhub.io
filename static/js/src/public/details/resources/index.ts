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

function setActiveNavItem() {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".p-in-page-navigation__link")
  );
  const active = links.find(
    (link) => link.getAttribute("href") === window.location.hash
  );

  if (!active) {
    return;
  }

  links.forEach((link) => {
    if (link === active) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function handleNavHighlight() {
  setActiveNavItem();
  window.addEventListener("hashchange", setActiveNavItem);
}

// Pagination of the release history is handled by React (see revisions.tsx).
function init() {
  handleCopy();
  handleNavHighlight();
}

export { init, setActiveNavItem };

declareGlobal("charmhub.resources", { init });
