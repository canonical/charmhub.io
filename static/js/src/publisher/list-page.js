import { WeeklyActiveDevicesTrend } from "./graphs/activeDevices";
import debounce from "../libs/debounce";
import initCloseButton from "../libs/notification-close";

const init = () => {
  // To DO - replace dummy data with API data
  const DUMMY_DATA = [
    {
      series: [
        {
          name: "test-charm0",
          values: [0, 20, 5, 0, 50, 20, 50],
        },
      ],
      buckets: [
        "2020-06-14",
        "2020-06-15",
        "2020-06-16",
        "2020-06-17",
        "2020-06-18",
        "2020-06-19",
        "2020-06-20",
      ],
    },
    {
      series: [
        {
          name: "test-charm1",
          values: [150, 120, 60, 10, 90, 20, 75],
        },
      ],
      buckets: [
        "2020-06-14",
        "2020-06-15",
        "2020-06-16",
        "2020-06-17",
        "2020-06-18",
        "2020-06-19",
        "2020-06-20",
      ],
    },
    {
      series: [
        {
          name: "test-charm2",
          values: [150, 120, 60, 10, 90, 20, 75],
        },
      ],
      buckets: [
        "2020-06-14",
        "2020-06-15",
        "2020-06-16",
        "2020-06-17",
        "2020-06-18",
        "2020-06-19",
        "2020-06-20",
      ],
    },
    {
      series: [
        {
          name: "test-charm3",
          values: [150, 120, 60, 10, 90, 20, 75],
        },
      ],
      buckets: [
        "2020-06-14",
        "2020-06-15",
        "2020-06-16",
        "2020-06-17",
        "2020-06-18",
        "2020-06-19",
        "2020-06-20",
      ],
    },
  ];

  const holderSelector = "[data-js='active-devices-trend']";
  const holderElements = document.querySelectorAll(holderSelector);
  const graphElements = [];
  if (!holderElements) {
    throw new Error(
      `There are no elements containing ${holderSelector} attribute.`
    );
  }

  holderElements.forEach((holderEl, i) => {
    const holderSvgSelector = `[data-svg='${holderEl.getAttribute(
      "data-svg"
    )}']`;
    graphElements.push(
      new WeeklyActiveDevicesTrend(holderEl, holderSvgSelector, DUMMY_DATA[i])
        .render()
        .show()
    );
  });

  const resize = debounce(
    () => {
      graphElements.forEach((el) => {
        el._prepareSVG()._prepareData().render();
      });
    },
    100,
    false
  );

  window.addEventListener("resize", resize);

  initCloseButton();
};

export { init };
