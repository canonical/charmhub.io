import { waitFor } from "@testing-library/react";
import { channelMap } from "../channelMap";
import { fireEvent } from "@testing-library/dom";

describe("channelMap", () => {
  let buttonEl: HTMLElement,
    selectedChannelEl: HTMLElement,
    channelCliEl: HTMLElement,
    channelMapContentEl: HTMLElement,
    channelMapEl: HTMLElement,
    selectedEl: HTMLElement,
    archFilterEl: HTMLSelectElement,
    baseFilterEl: HTMLSelectElement,
    maskEl: HTMLElement,
    channelsToBeFiltered: HTMLElement[];

  beforeEach(() => {
    buttonEl = document.createElement("button");
    buttonEl.setAttribute("data-js", "channel-map");
    selectedChannelEl = document.createElement("span");
    selectedChannelEl.setAttribute("data-js", "channel-map-selected");
    selectedChannelEl.innerText = "latest/stable 1.0.0";
    channelCliEl = document.createElement("span");
    channelCliEl.setAttribute("data-js", "channel-cli");
    channelMapContentEl = document.createElement("div");
    channelMapContentEl.setAttribute("class", "p-channel-map__content");
    channelMapEl = document.createElement("div");
    channelMapEl.setAttribute("class", "p-channel-map u-hide");
    maskEl = document.createElement("div");
    maskEl.setAttribute("class", "p-channel-map__mask");
    selectedEl = document.createElement("div");
    selectedEl.setAttribute("data-channel-map-track", "latest");
    selectedEl.setAttribute("data-channel-map-channel", "stable");
    selectedEl.setAttribute("data-channel-map-arch-filter", "arm64");

    archFilterEl = document.createElement("select");
    archFilterEl.setAttribute("data-js", "channel-map-arch-filter");
    baseFilterEl = document.createElement("select");
    baseFilterEl.setAttribute("data-js", "channel-map-base-filter");

    const archOption = document.createElement("option");
    archOption.value = "arm64";
    archOption.innerText = "arm64";
    archFilterEl.appendChild(archOption);

    const baseOption = document.createElement("option");
    baseOption.value = "20.04";
    baseOption.innerText = "20.04";
    baseFilterEl.appendChild(baseOption);

    buttonEl.appendChild(selectedChannelEl);
    channelMapEl.appendChild(maskEl);
    channelMapEl.appendChild(archFilterEl);
    channelMapEl.appendChild(baseFilterEl);
    channelMapEl.appendChild(channelMapContentEl);

    document.body.appendChild(buttonEl);
    document.body.appendChild(channelCliEl);
    document.body.appendChild(channelMapEl);
    document.body.appendChild(selectedEl);

    channelsToBeFiltered = [
      createChannelElement("latest", "stable", "arm64", "20.04"),
      createChannelElement("latest", "candidate", "amd64", "18.04"),
      createChannelElement("2.0", "stable", "arm64", "20.04"),
      createChannelElement("2.0", "candidate", "arm64", "20.04"),
    ];

    channelsToBeFiltered.forEach((el) => channelMapContentEl.appendChild(el));

    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "/", pathname: "/" },
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  test("should initialise the channelMap function correctly", () => {
    channelMap("test-package", buttonEl);

    expect(buttonEl.getAttribute("data-js")).toEqual("channel-map");
    expect(selectedChannelEl.getAttribute("data-js")).toEqual(
      "channel-map-selected"
    );
    expect(selectedChannelEl.innerText).toEqual("latest/stable 1.0.0");
  });

  test("should toggle the 'u-hide' class on button click", () => {
    channelMap("test-package", buttonEl);

    fireEvent.click(buttonEl);
    expect(channelMapEl.classList.contains("u-hide")).toEqual(false);

    fireEvent.click(buttonEl);
    expect(channelMapEl.classList.contains("u-hide")).toEqual(true);
  });

  test("should add the 'is-active' class to the selected channel", async () => {
    channelMap("test-package", buttonEl);

    fireEvent.click(buttonEl);

    await waitFor(() => {
      const selected = document.querySelector(
        `[data-channel-map-track="latest"][data-channel-map-channel="stable"]`
      );
      expect(selected).not.toBeNull();
      expect(selected?.classList.contains("is-active")).toBe(true);
    });
  });

  test("should navigate to the correct URL when a channel is clicked", () => {
    channelMap("test-package", buttonEl);

    fireEvent.click(buttonEl);
    fireEvent.click(channelsToBeFiltered[1]);

    expect(window.location.href).toEqual("/?channel=latest/candidate");
  });

  test("should apply architecture and base filters correctly", async () => {
    fireEvent.change(archFilterEl, { target: { value: "arm64" } });
    fireEvent.change(baseFilterEl, { target: { value: "20.04" } });

    await waitFor(() => {
      const visibleChannels = Array.from(
        channelMapContentEl.querySelectorAll<HTMLElement>(
          "[data-channel-map-channel]:not(.u-hide)"
        )
      );

      expect(visibleChannels.length).toEqual(4);

      expect(visibleChannels[0].dataset.channelMapChannel).toEqual("stable");
      expect(visibleChannels[1].dataset.channelMapChannel).toEqual("candidate");
      expect(visibleChannels[2].dataset.channelMapTrack).toEqual("2.0");
      expect(visibleChannels[3].dataset.channelMapArchFilter).toEqual("arm64");
    });
  });

  test("should hide older channels when filters are applied", async () => {
    channelMap("test-package", buttonEl);

    fireEvent.change(archFilterEl, { target: { value: "arm64" } });

    await waitFor(() => {
      const visibleChannels = Array.from(
        channelMapContentEl.querySelectorAll<HTMLElement>(
          "[data-channel-map-channel]:not(.u-hide)"
        )
      );

      expect(visibleChannels.length).toEqual(3);

      expect(visibleChannels[0].dataset.channelMapChannel).toEqual("stable");
      expect(visibleChannels[0].dataset.channelMapTrack).toEqual("latest");

      expect(visibleChannels[1].dataset.channelMapChannel).toEqual("stable");
      expect(visibleChannels[1].dataset.channelMapTrack).toEqual("2.0");

      expect(visibleChannels[2].dataset.channelMapChannel).toEqual("candidate");
      expect(visibleChannels[2].dataset.channelMapTrack).toEqual("2.0");
    });
  });

  test("should hide the channel map when the mask is clicked", () => {
    channelMap("test-package", buttonEl);

    fireEvent.click(buttonEl);
    fireEvent.click(maskEl);

    expect(channelMapEl.classList.contains("u-hide")).toEqual(true);
  });

  function createChannelElement(
    track: string,
    channel: string,
    arch: string,
    base: string
  ): HTMLElement {
    const el = document.createElement("div");
    el.setAttribute("data-channel-map-track", track);
    el.setAttribute("data-channel-map-channel", channel);
    el.setAttribute("data-channel-map-arch-filter", arch);
    el.setAttribute("data-channel-map-base-filter", base);
    return el;
  }
});
