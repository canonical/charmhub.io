class CharmSearchBox {
  constructor(config) {
    this.searchFilterElement = document.getElementById(config.searchFilterId);
    this.searchInput = document.getElementById(config.searchInputId);
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
    this.manualCharmInput = document.getElementById(config.manualCharmInputId);
    this.addManualButton = document.getElementById(config.addManualButtonId);
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

  init() {
    if (!this.searchInput || !this.selectedContainer) {
      console.warn("CharmSearchBox: Required elements not found");
      return;
    }

    this.setupEventListeners();
    this.handleSelectedChange();
  }

  setupEventListeners() {
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
        if (this.searchInput.value.trim().length >= 2) {
          this.searchCharms(this.searchInput.value.trim());
        }
      });
    }

    this.selectedContainer.addEventListener("click", (e) => {
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

    if (this.addManualButton && this.manualCharmInput) {
      this.addManualButton.addEventListener("click", async () => {
        const charmName = this.manualCharmInput.value.trim();
        if (charmName) {
          this.hideValidationError();

          const originalContent = this.addManualButton.textContent;
          this.addManualButton.disabled = true;
          this.addManualButton.innerHTML =
            '<i class="p-icon--spinner u-animation--spin"></i>';

          const exists = await this.validateCharm(charmName);

          this.addManualButton.disabled = false;
          this.addManualButton.textContent = originalContent;

          if (exists) {
            this.addCharm({ name: charmName });
            this.manualCharmInput.value = "";
          } else {
            this.showValidationError(
              `"${charmName}" does not exist in Charmhub. Please check the name and try again.`
            );
          }
        }
      });
    }
  }

  togglePanel(collapse) {
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

  handleSearchInput() {
    const query = this.searchInput.value.trim();

    clearTimeout(this.searchTimeout);

    if (query.length < 2) {
      this.hideResults();
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.searchCharms(query);
    }, 300);
  }

  async searchCharms(query) {
    try {
      const response = await fetch(
        `${this.apiEndpoint}?q=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      const charms = data.charms || [];
      this.showResults(charms);
    } catch (error) {
      console.error("Error searching charms:", error);
      this.showNoResults();
    }
  }

  showResults(charms) {
    if (!this.resultsContainer) return;

    this.resultsContainer.innerHTML = "";

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
        this.resultsContainer.appendChild(button);
      });

      if (this.resultsSection) this.resultsSection.style.display = "block";
      if (this.noResultsSection) this.noResultsSection.style.display = "none";
    } else {
      this.showNoResults();
    }
  }

  showNoResults() {
    if (this.resultsSection) this.resultsSection.style.display = "none";
    if (this.noResultsSection) this.noResultsSection.style.display = "block";
  }

  hideResults() {
    if (this.resultsSection) this.resultsSection.style.display = "none";
    if (this.noResultsSection) this.noResultsSection.style.display = "none";
  }

  addCharm(charm) {
    const existingCharms = this.getSelectedCharmNames();

    if (existingCharms.includes(charm.name)) {
      return;
    }

    const template = document.getElementById("charm-item-template");
    if (!template) {
      console.error("Charm item template not found");
      return;
    }

    const charmDiv = template.content.cloneNode(true).firstElementChild;
    charmDiv.setAttribute("data-charm-name", charm.name);

    const button = charmDiv.querySelector(".charm-remove");
    const span = charmDiv.querySelector("span");
    const input = charmDiv.querySelector("input[name='charms[]']");

    button.setAttribute("aria-label", `Remove ${charm.name}`);
    span.textContent = charm.name;
    input.value = charm.name;

    this.selectedContainer.appendChild(charmDiv);
    this.handleSelectedChange();
    this.searchInput.value = "";
    this.hideResults();
  }

  getSelectedCharmNames() {
    return Array.from(
      this.selectedContainer.querySelectorAll("[data-charm-name]")
    ).map((div) => div.getAttribute("data-charm-name"));
  }

  handleSelectedChange() {
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

  async validateCharm(charmName) {
    try {
      const response = await fetch(
        `/validate-charm?name=${encodeURIComponent(charmName)}`
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error validating charm:", error);
      return false;
    }
  }

  showValidationError(message) {
    if (this.validationContainer && this.validationMessage) {
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

  hideValidationError() {
    if (this.validationContainer && this.validationMessage) {
      this.validationMessage.textContent = "";
      this.validationMessage.setAttribute("hidden", "");
      this.validationContainer.classList.remove("is-error");
      this.manualCharmInput.removeAttribute("aria-invalid");
      this.manualCharmInput.removeAttribute("aria-describedby");
    }
  }
}

export default CharmSearchBox;
