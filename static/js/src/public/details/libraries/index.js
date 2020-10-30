import { TabSwitch } from "./tabSwitch";

const init = (tabSelector, tabContentSelector) => {
  const tabButtonsList = document.querySelectorAll(tabSelector);
  const tabContentList = document.querySelectorAll(tabContentSelector);

  if (tabButtonsList && tabContentList) {
    new TabSwitch(tabButtonsList, tabContentList);
  } else {
    throw new Error(
      `There are no elements containing or ${
        tabButtonsList ? tabContentSelector : tabSelector
      } selector.`
    );
  }
};

export { init };
