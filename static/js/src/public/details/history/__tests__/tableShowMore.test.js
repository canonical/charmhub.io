import { TableShowMore } from "../tableShowMore";

describe("TableShowMore", () => {
  let tableContainer;

  beforeEach(() => {
    tableContainer = document.createElement("div");
    tableContainer.innerHTML = `
      <div data-js="table-body">
        <div class="row">Row 1</div>
        <div class="row">Row 2</div>
        <div class="row">Row 3</div>
        <div class="row">Row 4</div>
        <div class="row">Row 5</div>
        <div class="row">Row 6</div>
        <div class="row">Row 7</div>
        <div class="row">Row 8</div>
        <div class="row">Row 9</div>
        <div class="row">Row 10</div>
      </div>
      <div data-js="table-footer" class="u-hide">
        <button data-js="show-more-button">Show More</button>
      </div>
      <div data-js="table-show-current"></div>
      <div data-js="table-show-total"></div>
    `;
    document.body.appendChild(tableContainer);
  });

  afterEach(() => {
    document.body.removeChild(tableContainer);
  });

  test("should initialise correctly", () => {
    const tableShowMore = new TableShowMore(tableContainer);

    expect(tableShowMore.showCurrent.innerHTML).toBe("5");
    expect(tableShowMore.showTotal.innerHTML).toBe("10");
    expect(
      tableContainer
        .querySelector('[data-js="table-footer"]')
        .classList.contains("u-hide")
    ).toBe(false);

    const rows = tableContainer.querySelectorAll(".row");
    rows.forEach((row, index) => {
      if (index < 5) {
        expect(row.classList.contains("u-hide")).toBe(false);
      } else {
        expect(row.classList.contains("u-hide")).toBe(true);
      }
    });
  });

  test("should show more rows when the button is clicked", () => {
    const tableShowMore = new TableShowMore(tableContainer);

    const showMoreButton = tableContainer.querySelector(
      '[data-js="show-more-button"]'
    );
    showMoreButton.click();

    expect(tableShowMore.showCurrent.innerHTML).toBe("10");
    expect(
      tableContainer
        .querySelector('[data-js="table-footer"]')
        .classList.contains("u-hide")
    ).toBe(true);

    const rows = tableContainer.querySelectorAll(".row");
    rows.forEach((row, index) => {
      expect(row.classList.contains("u-hide")).toBe(index >= 10);
    });
  });

  test('should hide the "Show More" button when all rows are visible', () => {
    tableContainer.innerHTML = `
      <div data-js="table-body">
        <div class="row">Row 1</div>
        <div class="row">Row 2</div>
        <div class="row">Row 3</div>
        <div class="row">Row 4</div>
        <div class="row">Row 5</div>
      </div>
      <div data-js="table-footer">
        <button data-js="show-more-button">Show More</button>
      </div>
      <div data-js="table-show-current"></div>
      <div data-js="table-show-total"></div>
    `;
    new TableShowMore(tableContainer);

    expect(
      tableContainer
        .querySelector('[data-js="table-footer"]')
        .classList.contains("u-hide")
    ).toBe(true);
  });

  test("should correctly hide rows when showRows is called with a specific number", () => {
    const tableShowMore = new TableShowMore(tableContainer);

    tableShowMore.showRows(5);

    const rows = tableContainer.querySelectorAll(".row");
    rows.forEach((row, index) => {
      if (index < 5) {
        expect(row.classList.contains("u-hide")).toBe(false);
      } else {
        expect(row.classList.contains("u-hide")).toBe(true);
      }
    });
  });

  test("should correctly show rows when showRows is called with a specific number", () => {
    const tableShowMore = new TableShowMore(tableContainer);

    tableShowMore.showRows(10);

    const rows = tableContainer.querySelectorAll(".row");
    rows.forEach((row, index) => {
      expect(row.classList.contains("u-hide")).toBe(index >= 10);
    });
  });
});
