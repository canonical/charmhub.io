import { truncateString } from "../../../libs/truncate-string";
import declareGlobal from "../../../libs/declare";

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
      summaryContentEl.textContent = truncatedSummary;

      showMoreEl.classList.remove("u-hide");

      showMoreEl.addEventListener("click", (e) => {
        e.preventDefault();
        showMoreEl.classList.add("u-hide");
        summaryContentEl.textContent = summary;
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

const init = () => {
  truncateSummary("[data-js='summary']");
  handleTopology();
};

export { init };

declareGlobal("charmhub.details.overview", { init });
