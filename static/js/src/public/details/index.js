import { HistoryState } from "./historyState";
import { TableOfContents } from "./tableOfContents";
import { channelMap } from "./channelMap";
import { truncateString } from "../../libs/truncate-string";

if (window.location.hash) {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 1);
}

const truncateSummary = (selector) => {
  const summaryEl = document.querySelector(selector);

  if (summaryEl) {
    const showMoreEl = summaryEl.querySelector("[data-js='summary-read-more']");
    const summaryContentEl = summaryEl.querySelector(
      "[data-js='summary-content']"
    );
    const summary = summaryEl.getAttribute("data-summary");

    if (summary.length > 103) {
      const truncatedSummary = truncateString(summary, 103);
      summaryContentEl.innerHTML = truncatedSummary;

      showMoreEl.classList.remove("u-hide");

      showMoreEl.addEventListener("click", (e) => {
        e.preventDefault();
        showMoreEl.classList.add("u-hide");
        summaryContentEl.innerHTML = summary;
      });
    }
  }
};

const handleTopology = () => {
  const topologyInfoPanel = document.querySelector("[data-js='topology-info']");
  const topologyModal = document.querySelector("[data-js='topology-modal']");

  if (topologyInfoPanel && topologyModal) {
    const closeModalButton = topologyModal.querySelector(
      "[aria-controls='modal']"
    );

    topologyInfoPanel.addEventListener("click", (e) => {
      e.preventDefault();
      topologyModal.classList.remove("u-hide");
    });

    closeModalButton.addEventListener("click", (e) => {
      e.preventDefault();
      topologyModal.classList.add("u-hide");
    });

    closeModalButton.addEventListener("click", (e) => {
      e.preventDefault();
      topologyModal.classList.add("u-hide");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key == "Escape") {
        topologyModal.classList.add("u-hide");
      }
    });
  }
};

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

  const channelMapButton = document.querySelector("[data-js='channel-map']");
  if (channelMapButton) {
    channelMap(packageName, channelMapButton);
  }

  truncateSummary("[data-js='summary']");
  handleTopology();
};

export { init };
