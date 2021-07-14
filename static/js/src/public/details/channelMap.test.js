import { channelMap } from "./channelMap";

describe("channelMap", () => {
  let buttonEl,
    selectedChannelEl,
    channelCliEl,
    channelMapContentEl,
    channelMapEl,
    selectedEl,
    filterEl,
    maskEl;

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
    selectedEl.setAttribute("data-channel-map-filter", "14.04 LTS");

    filterEl = document.createElement("select");
    filterEl.setAttribute("data-js", "channel-map-filter");

    buttonEl.appendChild(selectedChannelEl);
    channelMapEl.appendChild(maskEl);
    channelMapEl.appendChild(filterEl);
    channelMapEl.appendChild(channelMapContentEl);

    document.body.appendChild(buttonEl);
    document.body.appendChild(channelCliEl);
    document.body.appendChild(channelMapEl);
    document.body.appendChild(selectedEl);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should have the 'testChannelMap' defined", () => {
    const testChannelMap = new channelMap(
      "test-package",
      document.querySelector("[data-js='channel-map']")
    );
    expect(testChannelMap).toBeDefined();
  });

  it("should toggle the 'u-hide' class", () => {
    const testChannelMap = new channelMap(
      "test-package",
      document.querySelector("[data-js='channel-map']")
    );

    document.querySelector("[data-js='channel-map']").click();

    expect(
      document.querySelector(".p-channel-map").classList.contains("u-hide")
    ).toEqual(false);

    document.querySelector("[data-js='channel-map']").click();

    expect(
      document.querySelector(".p-channel-map").classList.contains("u-hide")
    ).toEqual(true);
  });

  it("should add the 'is-active' class to the 'latest' channel", () => {
    const testChannelMap = new channelMap(
      "test-package",
      document.querySelector("[data-js='channel-map']")
    );

    document.querySelector("[data-js='channel-map']").click();

    expect(
      document
        .querySelector(
          `[data-channel-map-track="latest"][data-channel-map-channel="stable"]`
        )
        .classList.contains("is-active")
    ).toEqual(true);
  });
});
