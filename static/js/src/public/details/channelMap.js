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

  const selectChannel = (channel, version) => {
    const selected = document.querySelector(
      `[data-channel-map-channel="${channelMapState.channel}"]`
    );

    selected.classList.remove("is-active");

    channelMapState.channel = channel;
    channelMapState.version = version;

    const newSelected = document.querySelector(
      `[data-channel-map-channel="${channel}"]`
    );

    newSelected.classList.add("is-active");

    currentChannel.innerHTML = `${channel} ${version}`;

    if (channel === "latest/stable") {
      channelCli.innerText = packageName;
    } else {
      channelCli.innerText = `${packageName} --channel=${channel}`;
    }
  };

  const showChannelMap = () => {
    channelMap.classList.remove("u-hide");
    channelMapButton.setAttribute("aria-expanded", "true");
    const selected = document.querySelector(
      `[data-channel-map-channel="${channelMapState.channel}"]`
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
        row.dataset.channelMapChannel,
        row.dataset.channelMapVersion
      );
    }
  });
};

export { init as channelMap };
