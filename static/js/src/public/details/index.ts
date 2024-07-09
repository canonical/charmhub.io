import { HistoryState } from "./historyState";
import { TableOfContents } from "./tableOfContents";
import { channelMap } from "./channelMap";

const init = (packageName: string) => {
  const historyState = new HistoryState();

  let configuration: TableOfContents | undefined;
  const configurationEl = document.querySelector<HTMLElement>("[data-js='configuration']");
  if (configurationEl) {
    configuration = new TableOfContents(configurationEl, historyState);
  }

  const actions = document.querySelector("[data-js='actions']");
  if (actions) {
    const actionButtons = actions.querySelectorAll<HTMLElement>("[role='tab']");
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

    actionButtons.forEach((actionButton) => {
      toggleAccordion(actionButton as HTMLElement);
    });

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

  let docs: TableOfContents | undefined;
  const docsEl = document.querySelector<HTMLElement>("[data-js='docs']");
  if (docsEl) {
    docs = new TableOfContents(docsEl, historyState);
  }

  const channelMapButton = document.querySelector<HTMLElement>("[data-js='channel-map']");
  if (channelMapButton) {
    channelMap(packageName, channelMapButton);
  }
};

export { init };
