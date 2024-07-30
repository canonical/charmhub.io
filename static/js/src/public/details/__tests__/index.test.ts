import { init } from "../index";
import { HistoryState } from "../historyState";
import { TableOfContents } from "../tableOfContents";
import { channelMap } from "../channelMap";
import { act, waitFor } from "@testing-library/react";

jest.mock("../historyState");
jest.mock("../tableOfContents");
jest.mock("../channelMap");

describe("index.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div data-js="configuration"></div>
      <div data-js="actions">
        <div role="tab" aria-controls="panel1" aria-expanded="false"></div>
        <div id="panel1" aria-hidden="true"></div>
      </div>
      <div data-js="docs"></div>
      <div data-js="channel-map"></div>
    `;
  });

  test("should initialise TableOfContents with configuration and docs elements", () => {
    const mockConfigurationEl = document.querySelector(
      "[data-js='configuration']"
    ) as HTMLElement;
    const mockDocsEl = document.querySelector(
      "[data-js='docs']"
    ) as HTMLElement;

    init("test-package");

    expect(TableOfContents).toHaveBeenCalledTimes(2);
    expect(TableOfContents).toHaveBeenCalledWith(
      mockConfigurationEl,
      expect.any(HistoryState)
    );
    expect(TableOfContents).toHaveBeenCalledWith(
      mockDocsEl,
      expect.any(HistoryState)
    );
  });

  test("should initialise channelMap with the channel map button", () => {
    const mockChannelMapButton = document.querySelector(
      "[data-js='channel-map']"
    ) as HTMLElement;

    init("test-package");

    expect(channelMap).toHaveBeenCalledWith(
      "test-package",
      mockChannelMapButton
    );
  });

  test("should toggle accordion correctly and set aria attributes", async () => {
    const actionButton = document.querySelector("[role='tab']") as HTMLElement;
    const panel = document.querySelector("#panel1") as HTMLElement;

    init("test-package");

    act(() => {
      actionButton.click();
    });

    await waitFor(() => {
      expect(actionButton.getAttribute("aria-expanded")).toBe("true");
      expect(panel.getAttribute("aria-hidden")).toBe("false");
    });
  });

  test("should handle clicks on action buttons and toggle accordion", () => {
    const actionButton = document.querySelector("[role='tab']") as HTMLElement;
    const mockActionsElement = document.querySelector(
      "[data-js='actions']"
    ) as HTMLElement;

    jest
      .spyOn(mockActionsElement, "addEventListener")
      .mockImplementation(
        (event: string, listener: EventListenerOrEventListenerObject) => {
          if (event === "click" && typeof listener === "function") {
            (listener as Function)({
              target: actionButton,
            } as unknown as Event);
          }
        }
      );

    init("test-package");

    expect(mockActionsElement.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
  });

  test("should initialise HistoryState correctly", () => {
    init("test-package");
    expect(HistoryState).toHaveBeenCalled();
  });
});
