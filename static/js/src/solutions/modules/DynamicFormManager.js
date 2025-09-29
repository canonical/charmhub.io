class DynamicFormManager {
  constructor(config) {
    this.listContainer = document.getElementById(config.listContainerId);
    this.addButton = document.getElementById(config.addButtonId);
    this.createItemFunction = config.createItemFunction;
    this.maxItems = config.maxItems || Infinity;
    this.removeSelector = config.removeSelector;
    this.itemSelector = config.itemSelector;

    this.init();
  }

  init() {
    if (!this.listContainer || !this.addButton) {
      console.warn("DynamicFormManager: Required elements not found");
      return;
    }

    this.addButton.addEventListener("click", () => {
      this.addItem();
    });

    this.listContainer.addEventListener("click", (e) => {
      if (
        e.target.classList.contains(this.removeSelector) ||
        e.target.closest(`.${this.removeSelector}`)
      ) {
        this.removeItem(e);
      }
    });

    this.updateAddButton();
  }

  addItem() {
    const currentCount = this.listContainer.querySelectorAll(
      this.itemSelector
    ).length;

    if (currentCount >= this.maxItems) {
      return;
    }

    const newItem = this.createItemFunction();
    this.listContainer.appendChild(newItem);
    this.updateAddButton();
  }

  removeItem(event) {
    const item = event.target.closest(this.itemSelector);
    if (item) {
      item.remove();
      this.updateAddButton();
    }
  }

  updateAddButton() {
    if (!this.addButton) return;

    const currentCount = this.listContainer.querySelectorAll(
      this.itemSelector
    ).length;
    this.addButton.style.display =
      currentCount >= this.maxItems ? "none" : "inline-block";
  }

  getCurrentCount() {
    return this.listContainer.querySelectorAll(this.itemSelector).length;
  }
}

export default DynamicFormManager;
