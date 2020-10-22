import { TableShowMore } from "./tableShowMore";

const init = (tableSelector) => {
  const tableEl = document.querySelector(tableSelector);

  if (tableEl) {
    new TableShowMore(tableEl);
  } else {
    throw new Error(
      `There is no element containing ${tableSelector} selector.`
    );
  }
};

export { init };
