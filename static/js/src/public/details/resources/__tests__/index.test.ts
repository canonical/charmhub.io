import { init } from "../index";
import { fireEvent, waitFor } from "@testing-library/dom";

function renderRows(total: number, limit: number) {
  return Array.from(
    { length: total },
    (_, i) =>
      `<tr class="js-revision-row${i >= limit ? " u-hide" : ""}"><td>${i}</td></tr>`
  ).join("");
}

describe("resources page", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("copy buttons", () => {
    const COPIED = "Copied";
    const COPY_DATA = "abc123";
    const LABEL = "Copy checksum";

    function setup() {
      document.body.innerHTML = `
        <button data-js="copy" data-copy="abc123" aria-label="Copy checksum">
          <i class="p-icon--copy"></i>
        </button>`;
      init();
      return document.querySelector("button") as HTMLButtonElement;
    }

    test("copies the data-copy value and shows feedback", async () => {
      const writeText: ReturnType<typeof vi.fn> = vi
        .fn()
        .mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const button = setup();
      fireEvent.click(button.querySelector("i") as HTMLElement);

      expect(writeText).toHaveBeenCalledWith(COPY_DATA);
      await waitFor(() =>
        expect(button.getAttribute("aria-label")).toBe(COPIED)
      );
      expect(button.querySelector("i")?.className).toBe("p-icon--success");
    });

    test("button goes back to original state after 2 secs", async () => {
      vi.useFakeTimers();

      const button = setup();
      fireEvent.click(button.querySelector("i") as HTMLElement);

      // just before timeout that sets button back to its original state
      await vi.advanceTimersByTimeAsync(1999);
      expect(button.getAttribute("aria-label")).toBe(COPIED);

      // timeout expires
      await vi.advanceTimersByTimeAsync(1);
      expect(button.getAttribute("aria-label")).toBe(LABEL);
      expect(button.querySelector("i")?.className).toBe("p-icon--copy");
    });
  });

  describe("show more revisions", () => {
    function setup(total: number, limit = 10) {
      document.body.innerHTML = `
        <table><tbody>${renderRows(total, limit)}</tbody></table>
        <span class="js-revisions-count">${Math.min(total, limit)}</span>
        <button class="js-show-more-revisions" data-limit="${limit}">Show more</button>`;
      init();
      return document.querySelector(
        ".js-show-more-revisions"
      ) as HTMLButtonElement;
    }

    test("reveals the next batch and updates the count and label", () => {
      const button = setup(25);
      fireEvent.click(button);

      expect(
        document.querySelectorAll(".js-revision-row:not(.u-hide)")
      ).toHaveLength(20);
      expect(document.querySelector(".js-revisions-count")?.textContent).toBe(
        "20"
      );
      expect(button.textContent).toBe("Show 5 more");
    });

    test("removes the button when all revisions are visible", () => {
      const button = setup(15);
      fireEvent.click(button);

      expect(document.querySelectorAll(".js-revision-row.u-hide")).toHaveLength(
        0
      );
      expect(document.querySelector(".js-show-more-revisions")).toBeNull();
    });
  });
});
