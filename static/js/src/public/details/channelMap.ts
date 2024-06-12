const init = (packageName: string, channelMapButton: HTMLElement) => {
  const currentChannel = channelMapButton.querySelector(
    "[data-js='channel-map-selected']"
  ) as HTMLElement;
  const channelMapState = {
    channel: currentChannel?.innerText.split(" ")[0],
    version: currentChannel?.innerText.split(" ")[1],
    packageName,
  };

  const channelMap = document.querySelector(".p-channel-map");

  const mask = channelMap?.querySelector(".p-channel-map__mask");

  const channelMapContent = channelMap?.querySelector(".p-channel-map__content") as HTMLElement;

  const channelMapFilter = channelMap?.querySelector(
    "[data-js='channel-map-filter']"
  ) as HTMLSelectElement;
  const channelsToBeFiltered = channelMap?.querySelectorAll(
    "[data-channel-map-filter]"
  ) as NodeListOf<Element>;

  const selectChannel = (track: string, channel: string) => {
    var page = window.location.pathname;

    if (track === "latest" && channel === "stable") {
      window.location.href = `${page}`;
    } else {
      window.location.href = `${page}?channel=${track}/${channel}`;
    }
  };

  const showChannelMap = () => {
    channelMap?.classList.remove("u-hide");
    channelMapButton.setAttribute("aria-expanded", "true");

    var track = "latest";
    var channel = channelMapState.channel;

    if (channel.includes("/")) {
      track = channel.split("/")[0];
      channel = channel.split("/")[1];
    }

    const selected = document.querySelector(
      `[data-channel-map-track="${track}"][data-channel-map-channel="${channel}"]`
    );

    selected?.classList.add("is-active");
  };

  const hideChannelMap = () => {
    channelMap?.classList.add("u-hide");
    channelMapButton.removeAttribute("aria-expanded");
  };

  const toggleChannelMap = () => {
    if (channelMapButton.getAttribute("aria-expanded")) {
      hideChannelMap();
    } else {
      showChannelMap();
    }
  };

  mask?.addEventListener("click", () => {
    hideChannelMap();
  });

  channelMapButton.addEventListener("click", () => {
    toggleChannelMap();
  });

  channelMapContent.addEventListener("click", (e) => {
    let row = e.target as HTMLElement;

    while (
      row.dataset &&
      !row.dataset.channelMapChannel &&
      row.parentNode &&
      row.nodeName !== "TABLE"
    ) {
      row = row.parentNode as HTMLElement;
    }

    if (row.dataset && row.dataset.channelMapChannel && row.dataset.channelMapTrack) {
      selectChannel(
        row.dataset.channelMapTrack,
        row.dataset.channelMapChannel,
      );
    }
  });

  channelMapFilter.addEventListener("change", (e: Event) => {
    let target = e.target as HTMLSelectElement
    channelsToBeFiltered.forEach((el: Element) => { 
      if (
        el?.getAttribute("data-channel-map-filter")?.includes(target?.value) ||
        target.value === "any"
      ) {
        el.classList.remove("u-hide");
      } else {
        el.classList.add("u-hide");
      }
    });
  });
};

export { init as channelMap };
