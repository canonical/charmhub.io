import { init } from "../index";
import { fireEvent } from "@testing-library/dom";

describe("Panel Toggling Tests", () => {
  let originalBodyHTML: string;

  beforeEach(() => {
    originalBodyHTML = document.body.innerHTML;

    document.body.innerHTML = `
      <button class="js-panel-toggle" aria-controls="panel1">Toggle Panel 1</button>
      <div id="panel1" class="p-inline-list__panel" role="tabpanel">
        <input type="text" readonly />
      </div>

      <button class="js-panel-toggle" aria-controls="panel2">Toggle Panel 2</button>
      <div id="panel2" class="p-inline-list__panel" role="tabpanel">
        <input type="text" readonly />
      </div>
    `;

    init();
  });

  afterEach(() => {
    document.body.innerHTML = originalBodyHTML;
    jest.clearAllMocks();
  });

  describe("handleTogglePanels function", () => {
    test("should open the panel and set role when button is clicked", () => {
      const toggleButton = document.querySelector(
        'button[aria-controls="panel1"]'
      ) as HTMLElement;
      const panel = document.getElementById("panel1") as HTMLElement;
      const panelInput = panel.querySelector("input[readonly]") as HTMLElement;

      fireEvent.click(toggleButton);

      expect(panel.classList.contains("is-open")).toBe(true);
      expect(toggleButton.classList.contains("is-active")).toBe(true);
      expect(panel.getAttribute("role")).toBe("dialog");

      expect(document.activeElement).toBe(panelInput);
    });

    test("should close the panel and remove role when button is clicked again", () => {
      const toggleButton = document.querySelector(
        'button[aria-controls="panel1"]'
      ) as HTMLElement;
      const panel = document.getElementById("panel1") as HTMLElement;

      fireEvent.click(toggleButton);

      fireEvent.click(toggleButton);

      expect(panel.classList.contains("is-open")).toBe(false);
      expect(toggleButton.classList.contains("is-active")).toBe(false);
      expect(panel.getAttribute("role")).toBe(null);
    });

    test("should close the panel when Escape key is pressed", () => {
      const toggleButton = document.querySelector(
        'button[aria-controls="panel1"]'
      ) as HTMLElement;
      const panel = document.getElementById("panel1") as HTMLElement;

      fireEvent.click(toggleButton);

      fireEvent.keyDown(document, { keyCode: 27 });

      expect(panel.classList.contains("is-open")).toBe(false);
      expect(toggleButton.classList.contains("is-active")).toBe(false);
    });

    test("should close the panel when Tab key is pressed", () => {
      const toggleButton = document.querySelector(
        'button[aria-controls="panel1"]'
      ) as HTMLElement;
      const panel = document.getElementById("panel1") as HTMLElement;

      fireEvent.click(toggleButton);

      fireEvent.keyDown(document, { keyCode: 9 });

      expect(panel.classList.contains("is-open")).toBe(false);
      expect(toggleButton.classList.contains("is-active")).toBe(false);
    });

    test("should close panel when clicking outside", () => {
      const toggleButton = document.querySelector(
        'button[aria-controls="panel1"]'
      ) as HTMLElement;
      const panel = document.getElementById("panel1") as HTMLElement;

      fireEvent.click(toggleButton);

      fireEvent.click(document.body);

      expect(panel.classList.contains("is-open")).toBe(false);
      expect(toggleButton.classList.contains("is-active")).toBe(false);
    });

    test("should not close panel when clicking inside", () => {
      const toggleButton = document.querySelector(
        'button[aria-controls="panel1"]'
      ) as HTMLElement;
      const panel = document.getElementById("panel1") as HTMLElement;
      const panelInput = panel.querySelector("input[readonly]") as HTMLElement;

      fireEvent.click(toggleButton);

      fireEvent.click(panelInput);

      expect(panel.classList.contains("is-open")).toBe(true);
      expect(toggleButton.classList.contains("is-active")).toBe(true);
    });

    test("should open different panel and close the previous one", () => {
      const toggleButton1 = document.querySelector(
        'button[aria-controls="panel1"]'
      ) as HTMLElement;
      const panel1 = document.getElementById("panel1") as HTMLElement;

      const toggleButton2 = document.querySelector(
        'button[aria-controls="panel2"]'
      ) as HTMLElement;
      const panel2 = document.getElementById("panel2") as HTMLElement;

      fireEvent.click(toggleButton1);
      expect(panel1.classList.contains("is-open")).toBe(true);

      fireEvent.click(toggleButton2);
      expect(panel2.classList.contains("is-open")).toBe(true);

      expect(panel1.classList.contains("is-open")).toBe(false);
      expect(toggleButton1.classList.contains("is-active")).toBe(false);
    });
  });
});
