import { init } from "../index";
import { fireEvent, waitFor } from "@testing-library/dom";

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
});
