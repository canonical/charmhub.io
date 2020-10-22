class TableShowMore {
  constructor(el) {
    this.tableFooter = el.querySelector("[data-js='table-footer']");
    this.rows = [].slice.call(
      el.querySelector("[data-js='table-body']").children
    );
    this.showMoreButton = el.querySelector("[data-js='show-more-button']");
    this.showCurrent = el.querySelector("[data-js='table-show-current']");
    this.showTotal = el.querySelector("[data-js='table-show-total']");
    this.rowsToShow = 5;
    this.init();
  }

  init() {
    this.showRows();

    this.showTotal.innerHTML = this.rows.length;

    if (this.rowsToShow < this.rows.length) {
      this.tableFooter.classList.remove("u-hide");
    }

    this.showMoreButton.addEventListener("click", () => {
      this.showMoreButton.blur();
      this.rowsToShow = this.rowsToShow + 5;
      this.showRows(this.rowsToShow);
    });
  }

  showRows(numberOfRows) {
    if (numberOfRows) {
      this.showCurrent.innerHTML =
        numberOfRows < this.rows.length ? numberOfRows : this.rows.length;

      if (numberOfRows >= this.rows.length) {
        this.tableFooter.classList.add("u-hide");
      }

      for (const [i, el] of this.rows.entries()) {
        if (i < numberOfRows) {
          el.classList.remove("u-hide");
        } else {
          break;
        }
      }
    } else {
      this.showCurrent.innerHTML =
        this.rowsToShow < this.rows.length ? this.rowsToShow : this.rows.length;

      for (let i = this.rowsToShow; i < this.rows.length; i++) {
        this.rows[i].classList.add("u-hide");
      }
    }
  }
}

export { TableShowMore };
