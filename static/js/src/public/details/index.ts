import { HistoryState } from "./historyState";
import { TableOfContents } from "./tableOfContents";
import { channelMap } from "./channelMap";

const init = (packageName: string) => {
  const historyState = new HistoryState();

  const configurationEl = document.querySelector<HTMLElement>(
    "[data-js='configuration']"
  );
  if (configurationEl) {
    new TableOfContents(configurationEl, historyState);
  }

  const actions = document.querySelector("[data-js='actions']");
  if (actions) {
    const toggleAccordion = (button: HTMLElement) => {
      const controls = button.parentElement!.querySelector<HTMLElement>(
        `#${button.getAttribute("aria-controls")}`
      );
      let show = true;
      if (button.getAttribute("aria-expanded") === "true") {
        show = false;
      }
      button.setAttribute("aria-expanded", show.toString());
      if (controls) {
        controls.setAttribute("aria-hidden", (!show).toString());
      }
    };

    actions.addEventListener("click", (e: Event) => {
      let target = e.target as HTMLElement;

      while (target && !target.hasAttribute("role") && target.parentElement) {
        target = target.parentElement as HTMLElement;
      }

      if (target && target.getAttribute("role") === "tab") {
        toggleAccordion(target);
      }
    });
  }

  const docsEl = document.querySelector<HTMLElement>("[data-js='docs']");
  if (docsEl) {
    new TableOfContents(docsEl, historyState);
  }

  const channelMapButton = document.querySelector<HTMLElement>(
    "[data-js='channel-map']"
  );
  if (channelMapButton) {
    channelMap(packageName, channelMapButton);
  }
};

export { init };
