type DynamicFormManagerConfig = {
  listContainerId: string;
  addButtonId: string;
  createItemFunction?: () => Element | null;
  templateId?: string;
  maxItems?: number;
  removeSelector: string;
  itemSelector: string;
  onChange?: (currentCount: number) => void;
};

class DynamicFormManager {
  listContainer: HTMLElement | null;
  addButton: HTMLElement | null;
  createItemFunction?: () => Element | null;
  templateId?: string;
  maxItems: number;
  removeSelector: string;
  itemSelector: string;
  onChange?: (currentCount: number) => void;

  constructor(config: DynamicFormManagerConfig) {
    this.listContainer = document.getElementById(config.listContainerId);
    this.addButton = document.getElementById(config.addButtonId);
    this.createItemFunction = config.createItemFunction;
    this.templateId = config.templateId;
    this.maxItems = config.maxItems || Infinity;
    this.removeSelector = config.removeSelector;
    this.itemSelector = config.itemSelector;
    this.onChange = config.onChange;

    if (this.templateId && !this.createItemFunction) {
      const template = document.getElementById(
        this.templateId
      ) as HTMLTemplateElement | null;
      if (template) {
        this.createItemFunction = () => {
          const fragment = template.content.cloneNode(true) as DocumentFragment;
          return fragment.firstElementChild;
        };
      }
    }

    this.init();
  }

  init(): void {
    if (!this.listContainer || !this.addButton) {
      console.warn("DynamicFormManager: Required elements not found");
      return;
    }

    this.addButton.addEventListener("click", () => {
      this.addItem();
    });

    this.listContainer.addEventListener("click", (e) => {
      if (!(e.target instanceof Element)) {
        return;
      }

      if (
        e.target.classList.contains(this.removeSelector) ||
        e.target.closest(`.${this.removeSelector}`)
      ) {
        this.removeItem(e);
      }
    });

    this.updateAddButton();
    this.handleChange();
  }

  addItem(): void {
    if (!this.listContainer || !this.createItemFunction) {
      return;
    }

    const currentCount = this.listContainer.querySelectorAll(
      this.itemSelector
    ).length;

    if (currentCount >= this.maxItems) {
      return;
    }

    const newItem = this.createItemFunction();
    if (!newItem) {
      return;
    }

    this.listContainer.appendChild(newItem);
    this.updateAddButton();
    this.handleChange();
  }

  removeItem(event: MouseEvent): void {
    if (!(event.target instanceof Element)) {
      return;
    }

    const item = event.target.closest(this.itemSelector);
    if (item) {
      item.remove();
      this.updateAddButton();
      this.handleChange();
    }
  }

  updateAddButton(): void {
    if (!this.addButton || !this.listContainer) return;

    const currentCount = this.listContainer.querySelectorAll(
      this.itemSelector
    ).length;
    this.addButton.style.display =
      currentCount >= this.maxItems ? "none" : "inline-block";
  }

  handleChange(): void {
    if (typeof this.onChange === "function") {
      this.onChange(this.getCurrentCount());
    }
  }

  getCurrentCount(): number {
    if (!this.listContainer) {
      return 0;
    }

    return this.listContainer.querySelectorAll(this.itemSelector).length;
  }
}

export default DynamicFormManager;
