type CharmSearchBoxConfig = {
  searchFilterId: string;
  searchInputId: string;
  resultsPanelId: string;
  resultsContainerId: string;
  resultsSectionId: string;
  noResultsSectionId: string;
  selectedContainerId: string;
  selectedSectionId: string;
  manualCharmInputId: string;
  addManualButtonId: string;
  apiEndpoint?: string;
};

type Charm = {
  name: string;
};

type CharmSearchResponse = {
  charms?: Charm[];
};

type CharmValidationResponse = {
  exists?: boolean;
};

class CharmSearchBox {
  searchFilterElement: HTMLElement | null;
  searchInput: HTMLInputElement | null;
  resultsPanel: HTMLElement | null;
  resultsContainer: HTMLElement | null;
  resultsSection: HTMLElement | null;
  noResultsSection: HTMLElement | null;
  selectedContainer: HTMLElement | null;
  selectedValidationSection: HTMLElement | null;
  manualCharmInput: HTMLInputElement | null;
  addManualButton: HTMLButtonElement | null;
  validationContainer: HTMLElement | null;
  validationMessage: HTMLElement | null;
  searchTimeout: ReturnType<typeof setTimeout> | null;
  apiEndpoint: string;

  constructor(config: CharmSearchBoxConfig) {
    this.searchFilterElement = document.getElementById(config.searchFilterId);
    this.searchInput = document.getElementById(
      config.searchInputId
    ) as HTMLInputElement | null;
    this.resultsPanel = document.getElementById(config.resultsPanelId);
    this.resultsContainer = document.getElementById(config.resultsContainerId);
    this.resultsSection = document.getElementById(config.resultsSectionId);
    this.noResultsSection = document.getElementById(config.noResultsSectionId);
    this.selectedContainer = document.getElementById(
      config.selectedContainerId
    );
    this.selectedValidationSection = document.getElementById(
      config.selectedSectionId
    );
    this.manualCharmInput = document.getElementById(
      config.manualCharmInputId
    ) as HTMLInputElement | null;
    this.addManualButton = document.getElementById(
      config.addManualButtonId
    ) as HTMLButtonElement | null;
    this.validationContainer = document.getElementById(
      "manual-charm-validation"
    );
    this.validationMessage = document.getElementById(
      "charm-validation-message"
    );

    this.searchTimeout = null;
    this.apiEndpoint = config.apiEndpoint || "/all-charms";

    this.init();
  }

  init(): void {
    if (!this.searchInput || !this.selectedContainer) {
      console.warn("CharmSearchBox: Required elements not found");
      return;
    }

    this.setupEventListeners();
    this.handleSelectedChange();
  }

  setupEventListeners(): void {
    if (!this.searchInput || !this.selectedContainer) {
      return;
    }

    this.searchInput.addEventListener("focus", () => {
      this.togglePanel(false);
    });

    this.searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        this.togglePanel(true);
      }, 200);
    });

    this.searchInput.addEventListener("input", () => {
      this.handleSearchInput();
    });

    const searchButton = this.searchFilterElement?.querySelector(
      ".p-search-and-filter__search-button"
    );
    if (searchButton) {
      searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const query = this.searchInput?.value.trim() || "";
        if (query.length >= 2) {
          this.searchCharms(query);
        }
      });
    }

    this.selectedContainer.addEventListener("click", (e) => {
      if (!(e.target instanceof Element)) {
        return;
      }

      if (
        e.target.classList.contains("charm-remove") ||
        e.target.closest(".charm-remove")
      ) {
        const charmDiv = e.target.closest("[data-charm-name]");
        if (charmDiv) {
          charmDiv.remove();
          this.handleSelectedChange();
        }
      }
    });

    const addManualButton = this.addManualButton;
    const manualCharmInput = this.manualCharmInput;
    if (addManualButton && manualCharmInput) {
      addManualButton.addEventListener("click", async () => {
        const charmName = manualCharmInput.value.trim();
        if (charmName) {
          this.hideValidationError();

          const originalContent = addManualButton.textContent;
          addManualButton.disabled = true;
          addManualButton.innerHTML =
            '<i class="p-icon--spinner u-animation--spin"></i>';

          const exists = await this.validateCharm(charmName);

          addManualButton.disabled = false;
          addManualButton.textContent = originalContent;

          if (exists) {
            this.addCharm({ name: charmName });
            manualCharmInput.value = "";
          } else {
            this.showValidationError(
              `"${charmName}" does not exist in Charmhub. Please check the name and try again.`
            );
          }
        }
      });
    }
  }

  togglePanel(collapse?: boolean): void {
    if (!this.resultsPanel || !this.searchFilterElement) return;

    const container = this.searchFilterElement.querySelector(
      ".p-search-and-filter__search-container"
    );
    if (!container) return;

    if (typeof collapse === "undefined") {
      collapse = this.resultsPanel.getAttribute("aria-hidden") !== "false";
    }

    if (collapse) {
      this.resultsPanel.setAttribute("aria-hidden", "true");
      container.setAttribute("aria-expanded", "false");
    } else {
      this.resultsPanel.setAttribute("aria-hidden", "false");
      container.setAttribute("aria-expanded", "true");
    }
  }

  handleSearchInput(): void {
    if (!this.searchInput) {
      return;
    }

    const query = this.searchInput.value.trim();

    if (this.searchTimeout) {
      window.clearTimeout(this.searchTimeout);
    }

    if (query.length < 2) {
      this.hideResults();
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.searchCharms(query);
    }, 300);
  }

  async searchCharms(query: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}?q=${encodeURIComponent(query)}&limit=10`
      );
      const data = (await response.json()) as CharmSearchResponse;
      const charms = data.charms || [];
      this.showResults(charms);
    } catch (error) {
      console.error("Error searching charms:", error);
      this.showNoResults();
    }
  }

  showResults(charms: Charm[]): void {
    const resultsContainer = this.resultsContainer;
    if (!resultsContainer) return;

    resultsContainer.innerHTML = "";

    if (charms.length > 0) {
      charms.forEach((charm) => {
        const button = document.createElement("button");
        button.className = "p-chip is-dense";
        button.type = "button";
        button.innerHTML = `<span class="p-chip__value">${charm.name}</span>`;
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.addCharm(charm);
        });
        resultsContainer.appendChild(button);
      });

      if (this.resultsSection) this.resultsSection.style.display = "block";
      if (this.noResultsSection) this.noResultsSection.style.display = "none";
    } else {
      this.showNoResults();
    }
  }

  showNoResults(): void {
    if (this.resultsSection) this.resultsSection.style.display = "none";
    if (this.noResultsSection) this.noResultsSection.style.display = "block";
  }

  hideResults(): void {
    if (this.resultsSection) this.resultsSection.style.display = "none";
    if (this.noResultsSection) this.noResultsSection.style.display = "none";
  }

  addCharm(charm: Charm): void {
    if (!this.selectedContainer || !this.searchInput) {
      return;
    }

    const existingCharms = this.getSelectedCharmNames();

    if (existingCharms.includes(charm.name)) {
      return;
    }

    const template = document.getElementById("charm-item-template");
    if (!template) {
      console.error("Charm item template not found");
      return;
    }

    if (!(template instanceof HTMLTemplateElement)) {
      console.error("Charm item template is not a template element");
      return;
    }

    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const charmDiv = fragment.firstElementChild as HTMLElement | null;
    if (!charmDiv) {
      return;
    }

    charmDiv.setAttribute("data-charm-name", charm.name);

    const button = charmDiv.querySelector(".charm-remove");
    const span = charmDiv.querySelector("span");
    const input = charmDiv.querySelector(
      "input[name='charms[]']"
    ) as HTMLInputElement | null;

    if (!button || !span || !input) {
      return;
    }

    button.setAttribute("aria-label", `Remove ${charm.name}`);
    span.textContent = charm.name;
    input.value = charm.name;

    this.selectedContainer.appendChild(charmDiv);
    this.handleSelectedChange();
    this.searchInput.value = "";
    this.hideResults();
  }

  getSelectedCharmNames(): string[] {
    if (!this.selectedContainer) {
      return [];
    }

    return Array.from(
      this.selectedContainer.querySelectorAll("[data-charm-name]")
    )
      .map((div) => div.getAttribute("data-charm-name"))
      .filter((name): name is string => Boolean(name));
  }

  handleSelectedChange(): void {
    if (!this.selectedValidationSection) return;

    if (this.getSelectedCharmNames().length > 0) {
      this.selectedValidationSection.classList.remove("is-error");

      const message = this.selectedValidationSection.querySelector(
        ".p-form-validation__message"
      );

      if (message) {
        message.setAttribute("hidden", "");
      }
    }
  }

  async validateCharm(charmName: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/validate-charm?name=${encodeURIComponent(charmName)}`
      );
      const data = (await response.json()) as CharmValidationResponse;
      return Boolean(data.exists);
    } catch (error) {
      console.error("Error validating charm:", error);
      return false;
    }
  }

  showValidationError(message: string): void {
    if (
      this.validationContainer &&
      this.validationMessage &&
      this.manualCharmInput
    ) {
      this.validationMessage.textContent = message;
      this.validationMessage.removeAttribute("hidden");
      this.validationContainer.classList.add("is-error");
      this.manualCharmInput.setAttribute("aria-invalid", "true");
      this.manualCharmInput.setAttribute(
        "aria-describedby",
        "charm-validation-message"
      );
    }
  }

  hideValidationError(): void {
    if (
      this.validationContainer &&
      this.validationMessage &&
      this.manualCharmInput
    ) {
      this.validationMessage.textContent = "";
      this.validationMessage.setAttribute("hidden", "");
      this.validationContainer.classList.remove("is-error");
      this.manualCharmInput.removeAttribute("aria-invalid");
      this.manualCharmInput.removeAttribute("aria-describedby");
    }
  }
}

export default CharmSearchBox;
