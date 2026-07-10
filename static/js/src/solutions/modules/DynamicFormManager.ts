interface DynamicFormManagerConfig {
  listContainerId: string;
  addButtonId: string;
  createItemFunction?: () => Element | null;
  templateId?: string;
  maxItems?: number;
  removeSelector: string;
  itemSelector: string;
  onChange?: (count: number) => void;
}

class DynamicFormManager {
  listContainer: HTMLElement | null;
  addButton: HTMLElement | null;
  createItemFunction?: () => Element | null;
  templateId?: string;
  maxItems: number;
  removeSelector: string;
  itemSelector: string;
  onChange?: (count: number) => void;

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
          return (template.content.cloneNode(true) as DocumentFragment)
            .firstElementChild;
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
      const target = e.target as Element;
      if (
        target.classList.contains(this.removeSelector) ||
        target.closest(`.${this.removeSelector}`)
      ) {
        this.removeItem(e);
      }
    });

    this.updateAddButton();
    this.handleChange();
  }

  addItem(): void {
    const currentCount = this.listContainer!.querySelectorAll(
      this.itemSelector
    ).length;

    if (currentCount >= this.maxItems) {
      return;
    }

    const newItem = this.createItemFunction!();
    this.listContainer!.appendChild(newItem!);
    this.updateAddButton();
    this.handleChange();
  }

  removeItem(event: Event): void {
    const item = (event.target as Element).closest(this.itemSelector);
    if (item) {
      item.remove();
      this.updateAddButton();
      this.handleChange();
    }
  }

  updateAddButton(): void {
    if (!this.addButton) return;

    const currentCount = this.listContainer!.querySelectorAll(
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
    return this.listContainer!.querySelectorAll(this.itemSelector).length;
  }
}

export default DynamicFormManager;
