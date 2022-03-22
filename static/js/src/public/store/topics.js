import buildTopicCard from "./buildTopicCard";

/** Store page filters */
class initTopics {
  constructor() {
    this.selectElements();
    this.togglePlaceholderContainer(true);
    this.searchCache = window.location.search;
    this._filters = this.getUrlFilters();

    if (this._filters.q.length === 0 && this._filters.filter.length === 0) {
      this.togglePlaceholderContainer();
      this.toggleFeaturedContainer(true);
    }

    this.fetchTopicList()
      .then((data) => {
        this.allTopics = data;

        if (!this.allTopics) {
          return;
        }

        this.groupAllTopics();
        this.filterTopics();
        this.handleFilterClick();

        if (this._filters.q.length > 0 || this._filters.filter.length > 0) {
          this.toggleFeaturedContainer(false);
          this.renderTopics();
          this.toggleTopicsContainer(true);
          this.togglePlaceholderContainer();
        }

        if (this.topics.length === 0) {
          this.toggleTopicsSection(false);
        } else {
          this.toggleTopicsSection(true);
        }
      })
      .catch((e) => console.error(e));
  }

  fetchTopicList() {
    return fetch("/topics.json")
      .then((res) => res.json())
      .then((result) => {
        if (this._filters.q) {
          const query = this._filters.q.join(",").toLowerCase().split(",");
          const matched = [];
          const unmatched = [];
          for (const topicIndex in result.topics) {
            const topic = result.topics[topicIndex];
            const match =
              query.filter(
                (q) => topic.name.includes(q) || topic.categories.includes(q)
              ).length > 0;
            if (match) {
              matched.push(topic);
            } else {
              unmatched.push(topic);
            }
          }
          return matched.concat(unmatched);
        }

        return result.topics;
      });
  }

  getUrlFilters() {
    const filters = {};

    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      for (const [filterType, filterValue] of searchParams) {
        filters[filterType] = filterValue.split(",");
      }
    }

    if (!filters.filter) {
      filters.filter = [];
    }

    if (!filters.q) {
      filters.q = [];
    }

    return filters;
  }

  selectElements() {
    this.domEl = {};

    this.domEl.categoryFilters = {
      el: document.querySelectorAll(".category-filter"),
      selector: ".category-filter",
    };
    this.domEl.topicsSection = {
      el: document.querySelector("[data-js='topics-section']"),
      selector: "[data-js='topics-section']",
    };
    this.domEl.placeholderContainer = {
      el: document.querySelector("[data-js='topics-placeholder-container']"),
      selector: "[data-js='topics-placeholder-container']",
    };
    this.domEl.topicsContainer = {
      el: document.querySelector("[data-js='topics-container']"),
      selector: "[data-js='topics-container']",
    };
    this.domEl.featuredContainer = {
      el: document.querySelector("[data-js='featured-topics-container']"),
      selector: "[data-js='featured-topics-container']",
    };
  }

  handleFilterClick() {
    if (this.domEl.categoryFilters.el) {
      this.domEl.categoryFilters.el.forEach((categoryFilter) => {
        categoryFilter.addEventListener("click", () => {
          if (categoryFilter.checked) {
            this._filters.filter.push(categoryFilter.value);
          } else {
            this._filters.filter = this._filters.filter.filter(
              (el) => el !== categoryFilter.value
            );
          }

          this.filterTopics();
          this.renderTopics();
          this.toggleFeaturedContainer();
          this.toggleTopicsContainer(true);
        });
      });
    } else {
      throw new Error(
        `There are no elements containing ${this.domEl.categoryFilters.selector} selector.`
      );
    }
  }

  groupAllTopics() {
    this.groupedTopics = {
      categories: {},
    };

    this.allTopics.forEach((entity) => {
      if (entity.categories) {
        entity.categories.forEach((cat) => {
          if (!this.groupedTopics.categories[cat]) {
            this.groupedTopics.categories[cat] = [];
          }
          this.groupedTopics.categories[cat].push(entity);
        });
      }
    });
  }

  toggleTopicsSection(visibility) {
    if (this.domEl.topicsSection.el) {
      if (visibility) {
        this.domEl.topicsSection.el.classList.remove("u-hide");
      } else {
        this.domEl.topicsSection.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.topicsSection.selector} selector.`
      );
    }
  }

  togglePlaceholderContainer(visibility) {
    if (this.domEl.placeholderContainer.el) {
      if (visibility) {
        this.domEl.placeholderContainer.el.classList.remove("u-hide");
      } else {
        this.domEl.placeholderContainer.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.placeholderContainer.selector} selector.`
      );
    }
  }

  toggleTopicsContainer(visibility) {
    if (this.domEl.topicsContainer.el) {
      if (visibility) {
        this.domEl.topicsContainer.el.classList.remove("u-hide");
      } else {
        this.domEl.topicsContainer.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.topicsContainer.selector} selector.`
      );
    }
  }

  toggleFeaturedContainer(visibility) {
    if (this.domEl.featuredContainer.el) {
      if (visibility) {
        this.domEl.featuredContainer.el.classList.remove("u-hide");
      } else {
        this.domEl.featuredContainer.el.classList.add("u-hide");
      }
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.featuredContainer.selector} selector.`
      );
    }
  }

  filterTopics() {
    if (this._filters.filter.length === 0) {
      this.topics = this.allTopics;
    } else {
      this.topics = this.allTopics.filter((entity) =>
        this.filterTopicsByCategory(entity)
      );

      if (this.topics.length < 3) {
        var bucketFillers = this.allTopics.reduce((acc, topic) => {
          if (!this.topics.includes(topic)) {
            acc.push(topic);
          }
          return acc;
        }, []);
        this.topics = this.topics.concat(bucketFillers);
      }
    }
  }

  filterTopicsByCategory(entity) {
    let packageCategories = [];

    if (entity.categories) {
      packageCategories = entity.categories.map((cat) => {
        return cat;
      });
    }

    const cats = this._filters.filter.filter((cat) => {
      if (packageCategories.includes(cat)) {
        return cat;
      }
    });

    if (cats.length) {
      return entity;
    }
  }

  renderTopics() {
    if (!("content" in document.createElement("template"))) {
      return;
    }

    if (this.domEl.topicsContainer.el) {
      this.domEl.topicsContainer.el.innerHTML = "";
      this.topics.slice(0, 3).forEach((entity) => {
        this.domEl.topicsContainer.el.appendChild(buildTopicCard(entity));
      });
    } else {
      throw new Error(
        `There is no element containing ${this.domEl.topicsContainer.selector} selector.`
      );
    }
  }
}

export { initTopics };
