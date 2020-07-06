import { HistoryState } from "../public/details/historyState";
import { Tabs } from "../public/details/tabs";

const init = () => {
  const historyState = new HistoryState();

  const tabsEl = document.querySelector("[data-js='tabs']");
  if (tabsEl) {
    new Tabs(tabsEl, historyState);
  }
};

export { init };
