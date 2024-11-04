import buildTopicCard from "../buildTopicCard";
import { truncateString } from "../../../libs/truncate-string";

describe("buildTopicCard", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <template id="topic-card-template">
        <div data-js="topic-card">
          <a class="p-card--href" href="#">
            <h3 class="p-muted-heading"></h3>
            <div class="p-card__content"></div>
          </a>
        </div>
      </template>
    `;
  });

  test("should create a topic card with the given data", () => {
    const entity = {
      slug: "test-topic",
      name: "Test Topic",
      description: "This is a description for the test topic.",
    };

    const result = buildTopicCard(entity);

    const entityCardContainer = result.querySelector(
      "[data-js='topic-card']"
    ) as HTMLElement;
    expect(entityCardContainer.id).toBe(entity.slug);

    const entityCard = result.querySelector(
      "a.p-card--href"
    ) as HTMLAnchorElement;
    expect(entityCard.href).toBe(`/topics/${entity.slug}`);

    const entityCardTitle = result.querySelector(
      "h3.p-muted-heading"
    ) as HTMLElement;
    expect(entityCardTitle.innerText).toBe(entity.name);

    const entityCardDescription = result.querySelector(
      ".p-card__content"
    ) as HTMLElement;
    expect(entityCardDescription.innerText).toBe(
      truncateString(entity.description, 200)
    );
  });

  test("should truncate description to 200 characters", () => {
    const longDescription = "a".repeat(300);
    const entity = {
      slug: "test-topic",
      name: "Test Topic",
      description: longDescription,
    };

    const result = buildTopicCard(entity);

    const entityCardDescription = result.querySelector(
      ".p-card__content"
    ) as HTMLElement;
    expect(entityCardDescription.innerText).toBe(
      truncateString(longDescription, 200)
    );
  });

  test("should handle empty description", () => {
    const entity = {
      slug: "test-topic",
      name: "Test Topic",
      description: "",
    };

    const result = buildTopicCard(entity);

    const entityCardDescription = result.querySelector(
      ".p-card__content"
    ) as HTMLElement;
    expect(entityCardDescription.innerText).toBe("");
  });

  test("should handle empty name", () => {
    const entity = {
      slug: "test-topic",
      name: "",
      description: "Description with some content.",
    };

    const result = buildTopicCard(entity);

    const entityCardTitle = result.querySelector(
      "h3.p-muted-heading"
    ) as HTMLElement;
    expect(entityCardTitle.innerText).toBe("");
  });

  test("should handle case where template does not exist", () => {
    document.body.innerHTML = "";

    const entity = {
      slug: "test-topic",
      name: "Test Topic",
      description: "Description content",
    };

    expect(() => {
      buildTopicCard(entity);
    }).toThrowError("Cannot read properties of null (reading 'content')");
  });
});
