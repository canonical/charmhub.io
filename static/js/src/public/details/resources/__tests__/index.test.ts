import { init } from "../index";
import { fireEvent, waitFor } from "@testing-library/dom";

describe("resources page", () => {
  // init() registers delegated listeners on `document`, which outlives each
  // test. Track and remove them so tests don't stack handlers on each other.
  const listeners: [string, EventListenerOrEventListenerObject][] = [];
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const addEventListener = document.addEventListener.bind(document);
    vi.spyOn(document, "addEventListener").mockImplementation(
      (type, listener, options) => {
        listeners.push([type, listener]);
        addEventListener(type, listener, options);
      }
    );

    // jsdom has no clipboard, so each test needs its own mock
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
  });

  afterEach(() => {
    listeners.forEach(([type, listener]) =>
      document.removeEventListener(type, listener)
    );
    listeners.length = 0;
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.useRealTimers();
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
