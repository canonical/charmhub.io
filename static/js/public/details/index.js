import { HistoryState } from "./historyState";
import { Tabs } from "./tabs";
import { TableOfContents } from "./tableOfContents";
import { channelMap } from "./channelMap";

if (window.location.hash) {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 1);
}

const init = (packageName) => {
  const historyState = new HistoryState();

  let configuration;
  const configurationEl = document.querySelector("[data-js='configuration']");
  if (configurationEl) {
    configuration = new TableOfContents(configurationEl, historyState);
  }

  const actions = document.querySelector("[data-js='actions']");
  if (actions) {
    const actionButtons = actions.querySelectorAll("[role='tab']");
    const toggleAccordion = (button) => {
      const controls = button.parentNode.querySelector(
        `#${button.getAttribute("aria-controls")}`
      );
      let show = true;
      if (button.getAttribute("aria-expanded") === "true") {
        show = false;
      }
      button.setAttribute("aria-expanded", show);
      controls.setAttribute("aria-hidden", !show);
    };

    actionButtons.forEach((actionButton) => {
      toggleAccordion(actionButton);
    });

    actions.addEventListener("click", (e) => {
      let target = e.target;

      while (!target.hasAttribute("role") && target.parentNode) {
        target = target.parentNode;
      }

      if (target.getAttribute("role") === "tab") {
        toggleAccordion(target);
      }
    });
  }

  let docs;
  const docsEl = document.querySelector("[data-js='docs']");
  if (docsEl) {
    docs = new TableOfContents(docsEl, historyState);
  }

  let tabs;
  const tabsEl = document.querySelector("[data-js='tabs']");
  if (tabsEl) {
    tabs = new Tabs(tabsEl, historyState, {
      configuration,
      docs,
    });
  }

  const channelMapButton = document.querySelector("[data-js='channel-map']");
  if (channelMapButton) {
    channelMap(packageName, channelMapButton);
  }
};

export { init };
