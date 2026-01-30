import { init } from "../index";
import { truncateString } from "../../../../libs/truncate-string";
import { fireEvent } from "@testing-library/dom";

vi.mock("../../../../libs/truncate-string");

describe("DOM manipulation tests", () => {
  let originalBodyHTML;

  beforeEach(() => {
    originalBodyHTML = document.body.innerHTML;

    document.body.innerHTML = `
      <div data-js="summary" data-summary="This is a long summary text that needs to be truncated. This part will be hidden initially.">
        <span data-js="summary-content"></span>
        <a href="#" data-js="summary-read-more" class="u-hide">Read More</a>
      </div>

      <div data-js="topology-info">Click to open modal</div>
      <div data-js="topology-modal" class="u-hide">
        <button aria-controls="modal">Close</button>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = originalBodyHTML;
    vi.clearAllMocks();
  });

  describe("index.js", () => {
    test('should truncate summary and reveal "Read More" link when summary is longer than 103 characters', () => {
      const summaryText =
        'This is a long summary text that needs to be truncated. This part will be hidden initially. It will be opened when "Read More" is clicked.';
      document
        .querySelector("[data-js='summary']")
        .setAttribute("data-summary", summaryText);

      const truncatedText =
        "This is a long summary text that needs to be truncated. This part will be hidden initial...";
      truncateString.mockReturnValue(truncatedText);

      init();

      const summaryContentEl = document.querySelector(
        "[data-js='summary-content']"
      );
      const showMoreEl = document.querySelector(
        "[data-js='summary-read-more']"
      );

      expect(truncateString).toHaveBeenCalledWith(summaryText, 103);
      expect(summaryContentEl.innerHTML).toBe(truncatedText);
      expect(showMoreEl.classList.contains("u-hide")).toBe(false);
    });

    test('should not truncate summary or reveal "Read More" link when summary is 103 characters or less', () => {
      const summaryText = "This is a short summary.";
      document
        .querySelector("[data-js='summary']")
        .setAttribute("data-summary", summaryText);

      init();

      const summaryContentEl = document.querySelector(
        "[data-js='summary-content']"
      );
      const showMoreEl = document.querySelector(
        "[data-js='summary-read-more']"
      );

      expect(truncateString).not.toHaveBeenCalled();
      expect(summaryContentEl.innerHTML).toBe("");
      expect(showMoreEl.classList.contains("u-hide")).toBe(true);
    });

    test('should reveal full summary when "Read More" link is clicked', () => {
      const summaryText =
        'This is a long summary text that needs to be truncated. This part will be hidden initially. It will be opened when "Read More" is clicked.';
      document
        .querySelector("[data-js='summary']")
        .setAttribute("data-summary", summaryText);

      const truncatedText =
        "This is a long summary text that needs to be truncated. This part will be hidden initial...";
      truncateString.mockReturnValue(truncatedText);

      init();

      const summaryContentEl = document.querySelector(
        "[data-js='summary-content']"
      );
      const showMoreEl = document.querySelector(
        "[data-js='summary-read-more']"
      );

      fireEvent.click(showMoreEl);
      expect(summaryContentEl.innerHTML).toBe(summaryText);
      expect(showMoreEl.classList.contains("u-hide")).toBe(true);
    });
  });

  describe("handleTopology", () => {
    test("should show topology modal when info panel is clicked", () => {
      const topologyInfoPanel = document.querySelector(
        "[data-js='topology-info']"
      );
      const topologyModal = document.querySelector(
        "[data-js='topology-modal']"
      );

      init();

      fireEvent.click(topologyInfoPanel);
      expect(topologyModal.classList.contains("u-hide")).toBe(false);
    });

    test("should hide topology modal when close button is clicked", () => {
      const closeModalButton = document.querySelector(
        "[aria-controls='modal']"
      );
      const topologyModal = document.querySelector(
        "[data-js='topology-modal']"
      );

      init();

      fireEvent.click(closeModalButton);
      expect(topologyModal.classList.contains("u-hide")).toBe(true);
    });

    test("should hide topology modal when Escape key is pressed", () => {
      const topologyModal = document.querySelector(
        "[data-js='topology-modal']"
      );

      init();

      fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
      expect(topologyModal.classList.contains("u-hide")).toBe(true);
    });
  });

  describe("init", () => {
    test("should initialise both truncateSummary and handleTopology functions", () => {
      const summaryText =
        'This is a long summary text that needs to be truncated. This part will be hidden initially. It will be opened when "Read More" is clicked.';
      const truncatedText =
        "This is a long summary text that needs to be truncated. This part will be hidden initial...";

      truncateString.mockReturnValue(truncatedText);

      document
        .querySelector("[data-js='summary']")
        .setAttribute("data-summary", summaryText);

      init();

      const summaryContentEl = document.querySelector(
        "[data-js='summary-content']"
      );
      const showMoreEl = document.querySelector(
        "[data-js='summary-read-more']"
      );
      const topologyInfoPanel = document.querySelector(
        "[data-js='topology-info']"
      );
      const topologyModal = document.querySelector(
        "[data-js='topology-modal']"
      );

      expect(truncateString).toHaveBeenCalledWith(summaryText, 103);
      expect(summaryContentEl.innerHTML).toBe(truncatedText);
      expect(showMoreEl.classList.contains("u-hide")).toBe(false);

      fireEvent.click(topologyInfoPanel);
      expect(topologyModal.classList.contains("u-hide")).toBe(false);
    });
  });
});
