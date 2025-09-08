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

  const channelMapContent = channelMap?.querySelector(
    ".p-channel-map__content"
  ) as HTMLElement;

  const channelMapArchFilter = channelMap?.querySelector(
    "[data-js='channel-map-arch-filter']"
  ) as HTMLSelectElement;
  const channelMapBaseFilter = channelMap?.querySelector(
    "[data-js='channel-map-base-filter']"
  ) as HTMLSelectElement;
  const channelsToBeFiltered = channelMap?.querySelectorAll(
    "[data-channel-map-channel]"
  ) as NodeListOf<Element>;

  const supportedBases = channelMap?.querySelectorAll(
    "[data-base-supported-archs]"
  ) as NodeListOf<Element>;

  const selectChannel = (track: string, channel: string) => {
    const page = window.location.pathname;

    if (track === "latest" && channel === "stable") {
      window.location.href = `${page}`;
    } else {
      window.location.href = `${page}?channel=${track}/${channel}`;
    }
  };

  const showChannelMap = () => {
    channelMap?.classList.remove("u-hide");
    channelMapButton.setAttribute("aria-expanded", "true");

    let track = "latest";
    let channel = channelMapState.channel;

    if (channel.includes("/")) {
      track = channel.split("/")[0];
      channel = channel.split("/")[1];
    }

    const selected = document.querySelector(
      `[data-channel-map-track="${track}"][data-channel-map-channel="${channel}"][data-channel-map-version="${channelMapState.version}"]`
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

    if (
      row.dataset &&
      row.dataset.channelMapChannel &&
      row.dataset.channelMapTrack
    ) {
      selectChannel(row.dataset.channelMapTrack, row.dataset.channelMapChannel);
    }
  });

  function hideOlderChannels() {
    const channelRevisions = new Map();

    // find the highest revision for each channel
    channelsToBeFiltered.forEach((el) => {
      if (el.classList.contains("u-hide")) {
        return;
      }

      const track = el.getAttribute("data-channel-map-track");
      const channel = el.getAttribute("data-channel-map-channel");
      const version = el.getAttribute("data-channel-map-version");

      if (!track || !channel || !version) return;

      const trackChannel = `${track}${channel}`;

      if (
        !channelRevisions.has(trackChannel) ||
        parseInt(version) > parseInt(channelRevisions.get(trackChannel)!)
      ) {
        channelRevisions.set(trackChannel, version);
      }
    });

    // hide revisions that aren't the highest
    channelsToBeFiltered.forEach((el) => {
      if (el.classList.contains("u-hide")) {
        return;
      }

      const track = el.getAttribute("data-channel-map-track");
      const channel = el.getAttribute("data-channel-map-channel");
      const version = el.getAttribute("data-channel-map-version");

      if (!track || !channel || !version) return;

      const trackChannel = `${track}${channel}`;

      if (version !== channelRevisions.get(trackChannel)) {
        el.classList.add("u-hide");
      }
    });
  }

  function handleFilterChange() {
    const archValue = channelMapArchFilter.value;
    const baseValue = channelMapBaseFilter.value;

    channelsToBeFiltered.forEach((el) => {
      const matchesArch =
        el?.getAttribute("data-channel-map-arch-filter")?.includes(archValue) ||
        archValue === "any";
      const matchesBase =
        el?.getAttribute("data-channel-map-base-filter")?.includes(baseValue) ||
        baseValue === "any";

      if (matchesArch && matchesBase) {
        el.classList.remove("u-hide");
      } else {
        el.classList.add("u-hide");
      }
    });

    supportedBases.forEach((el) => {
      const matchesBase =
        el?.getAttribute("data-base-supported-archs")?.includes(archValue) ||
        archValue === "any";

      if (matchesBase) {
        el.classList.remove("u-hide");
      } else {
        el.classList.add("u-hide");
      }
    });

    hideOlderChannels();
  }

  channelMapArchFilter.addEventListener("change", handleFilterChange);
  channelMapBaseFilter.addEventListener("change", handleFilterChange);
  hideOlderChannels();
};

export { init as channelMap };
