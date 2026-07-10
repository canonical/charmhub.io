const MIN_CATEGORIES = 1;
const MAX_CATEGORIES = 2;

interface CategorySelectorConfig {
  containerId?: string;
  sectionId?: string;
  checkboxSelector?: string;
  min?: number;
  max?: number;
}

class CategorySelector {
  container: HTMLElement | null;
  section: HTMLElement | null;
  checkboxSelector: string;
  min: number;
  max: number;
  checkboxes: HTMLInputElement[];

  constructor({
    containerId = "categories-list",
    sectionId = "categories-section",
    checkboxSelector = ".category-checkbox",
    min = MIN_CATEGORIES,
    max = MAX_CATEGORIES,
  }: CategorySelectorConfig = {}) {
    this.container = document.getElementById(containerId);
    this.section = document.getElementById(sectionId);
    this.checkboxSelector = checkboxSelector;
    this.min = min;
    this.max = max;
    this.checkboxes = [];

    if (!this.container) {
      return;
    }

    this.checkboxes = Array.from(
      this.container.querySelectorAll<HTMLInputElement>(checkboxSelector)
    );

    this.checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => this.handleChange());
    });

    this.enforce();
  }

  getCheckedCount(): number {
    return this.checkboxes.filter((checkbox) => checkbox.checked).length;
  }

  handleChange(): void {
    this.enforce();

    if (this.getCheckedCount() > 0) {
      this.clearError();
    }
  }

  enforce(): void {
    if (!this.checkboxes) {
      return;
    }

    const limitReached = this.getCheckedCount() >= this.max;

    this.checkboxes.forEach((checkbox) => {
      checkbox.disabled = limitReached && !checkbox.checked;
    });
  }

  clearError(): void {
    if (!this.section) {
      return;
    }

    this.section.classList.remove("is-error");

    const message = this.section.querySelector(".p-form-validation__message");
    if (message) {
      message.setAttribute("hidden", "");
    }
  }

  showError(): void {
    if (!this.section) {
      return;
    }

    this.section.classList.add("is-error");

    const message = this.section.querySelector(".p-form-validation__message");
    if (message) {
      message.removeAttribute("hidden");
    }

    this.section.scrollIntoView({ behavior: "smooth" });
  }

  isValid(): boolean {
    if (!this.container || this.checkboxes.length === 0) {
      return true;
    }

    const count = this.getCheckedCount();

    if (count < this.min || count > this.max) {
      this.showError();
      return false;
    }

    this.clearError();
    return true;
  }
}

export default CategorySelector;
