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
    this.manualCharmInput = document.getElementById(config.manualCharmInputId);
    this.addManualButton = document.getElementById(config.addManualButtonId);

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
        }
      }
    });

    if (this.addManualButton && this.manualCharmInput) {
      this.addManualButton.addEventListener("click", () => {
        const charmName = this.manualCharmInput.value.trim();
        if (charmName) {
          this.addCharm({ name: charmName });
          this.manualCharmInput.value = "";
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

    const charmDiv = document.createElement("div");
    charmDiv.setAttribute("data-charm-name", charm.name);
    charmDiv.innerHTML = `
      <button type="button" class="p-button--negative has-icon is-small charm-remove" aria-label="Remove ${charm.name}">
        <i class="p-icon--delete is-dark"></i>
      </button>
      <span>${charm.name}</span>
      <input type="hidden" name="charms[]" value="${charm.name}">
    `;

    this.selectedContainer.appendChild(charmDiv);
    this.searchInput.value = "";
    this.hideResults();
  }

  getSelectedCharmNames() {
    return Array.from(
      this.selectedContainer.querySelectorAll("[data-charm-name]")
    ).map((div) => div.getAttribute("data-charm-name"));
  }
}

export default CharmSearchBox;
