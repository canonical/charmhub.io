import { truncateString } from "../../../libs/truncate-string";

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

const init = () => {
  truncateSummary("[data-js='summary']");
};

export { init };
