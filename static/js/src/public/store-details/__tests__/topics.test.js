import { initTopics } from "../topics";
import buildTopicCard from "../buildTopicCard";
import userEvent from "@testing-library/user-event";

vi.mock("../buildTopicCard");

global.fetch = vi.fn();

describe("initTopics Class", () => {
  let instance;

  beforeEach(() => {
    fetch.mockClear();
    buildTopicCard.mockClear();

    fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ topics: [] }),
      })
    );

    document.body.innerHTML = `
      <div data-js="topics-section"></div>
      <div data-js="topics-placeholder-container"></div>
      <div data-js="topics-container"></div>
      <div data-js="featured-topics-container"></div>
      <input type="checkbox" class="category-filter" value="tech" />
      <input type="checkbox" class="category-filter" value="science" />
    `;

    instance = new initTopics();
  });

  test("should initialise filters and elements correctly", () => {
    expect(instance._filters).toEqual({ q: [], filter: [] });
    expect(instance.domEl.categoryFilters.el.length).toBe(2);
  });

  test("should handle empty filters", async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ topics: [] }),
    });

    await instance.fetchTopicList();
    expect(instance.allTopics).toEqual([]);
  });

  test("should fetch topics based on query parameters", async () => {
    const originalLocation = global.location;
    delete global.location;
    global.location = { search: "?q=tech,science" };

    fetch.mockImplementation((url) => {
      if (url === "/topics.json?q=tech,science") {
        return Promise.resolve({
          json: () =>
            Promise.resolve({ topics: [{ id: 1, categories: ["tech"] }] }),
        });
      }
      return Promise.reject(new Error("Not Found"));
    });

    instance = new initTopics();

    await instance.fetchTopicList();
    expect(fetch).toHaveBeenCalledWith("/topics.json?q=tech,science");
    expect(instance.allTopics).toEqual([{ id: 1, categories: ["tech"] }]);

    global.location = originalLocation;
  });

  test("should group topics by category", () => {
    instance.allTopics = [
      { id: 1, categories: ["tech"] },
      { id: 2, categories: ["science"] },
    ];

    instance.groupAllTopics();
    expect(instance.groupedTopics).toEqual({
      categories: {
        tech: [{ id: 1, categories: ["tech"] }],
        science: [{ id: 2, categories: ["science"] }],
      },
    });
  });

  test("should toggle visibility of topics section", () => {
    instance.toggleTopicsSection(true);
    expect(instance.domEl.topicsSection.el.classList).not.toContain("u-hide");

    instance.toggleTopicsSection(false);
    expect(instance.domEl.topicsSection.el.classList).toContain("u-hide");
  });

  test("should render topics", () => {
    instance.topics = [{ id: 1, categories: ["tech"] }];
    const topicCard = document.createElement("div");
    buildTopicCard.mockReturnValue(topicCard);

    instance.renderTopics();
    expect(instance.domEl.topicsContainer.el.children.length).toBe(1);
    expect(buildTopicCard).toHaveBeenCalledWith({
      id: 1,
      categories: ["tech"],
    });
  });

  test("should handle filter click event", async () => {
    const user = userEvent.setup();
    const checkbox = document.querySelector(`.category-filter[value="tech"]`);
    await user.click(checkbox);

    expect(instance._filters.filter).toContain("tech");
  });
});
