const init = (packageName, channelMapButton) => {
  const currentChannel = channelMapButton.querySelector(
    "[data-js='channel-map-selected']"
  );
  const channelCli = document.querySelector("[data-js='channel-cli']");
  const channelMapState = {
    channel: currentChannel.innerText.split(" ")[0],
    version: currentChannel.innerText.split(" ")[1],
    packageName,
  };

  const channelMap = document.querySelector(".p-channel-map");

  const mask = channelMap.querySelector(".p-channel-map__mask");

  const channelMapContent = channelMap.querySelector(".p-channel-map__content");

  const channelMapFilter = channelMap.querySelector(
    "[data-js='channel-map-filter']"
  );
  const channelsToBeFiltered = channelMap.querySelectorAll(
    "[data-channel-map-filter]"
  );

  const selectChannel = (track, channel) => {
    var page = window.location.pathname;

    if (track === "latest" && channel === "stable") {
      window.location.href = `${page}`;
    } else {
      window.location.href = `${page}?channel=${track}/${channel}`;
    }
  };

  const showChannelMap = () => {
    channelMap.classList.remove("u-hide");
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

    selected.classList.add("is-active");
  };

  const hideChannelMap = () => {
    channelMap.classList.add("u-hide");
    channelMapButton.removeAttribute("aria-expanded");
  };

  const toggleChannelMap = () => {
    if (channelMapButton.getAttribute("aria-expanded")) {
      hideChannelMap();
    } else {
      showChannelMap();
    }
  };

  mask.addEventListener("click", () => {
    hideChannelMap();
  });

  channelMapButton.addEventListener("click", () => {
    toggleChannelMap();
  });

  channelMapContent.addEventListener("click", (e) => {
    let row = e.target;

    while (
      row.dataset &&
      !row.dataset.channelMapChannel &&
      row.parentNode &&
      row.nodeName !== "TABLE"
    ) {
      row = row.parentNode;
    }

    if (row.dataset && row.dataset.channelMapChannel) {
      selectChannel(
        row.dataset.channelMapTrack,
        row.dataset.channelMapChannel,
        row.dataset.channelMapVersion
      );
    }
  });

  channelMapFilter.addEventListener("change", (e) => {
    channelsToBeFiltered.forEach((el) => {
      if (
        el.getAttribute("data-channel-map-filter").includes(e.target.value) ||
        e.target.value === "any"
      ) {
        el.classList.remove("u-hide");
      } else {
        el.classList.add("u-hide");
      }
    });
  });
};

export { init as channelMap };
