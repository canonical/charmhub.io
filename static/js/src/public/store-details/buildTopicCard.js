import { truncateString } from "../../libs/truncate-string";

function buildTopicCard(entity) {
  const template = document.getElementById("topic-card-template");
  const clone = template.content.cloneNode(true);

  const entityCardContainer = clone.querySelector("[data-js='topic-card']");
  entityCardContainer.id = entity.slug;

  const entityCard = clone.querySelector("a.p-card--href");
  entityCard.href = `/topics/${entity.slug}`;

  const entityCardTitle = clone.querySelector("h3.p-muted-heading");
  entityCardTitle.innerText = entity.name;

  const entityCardDescription = clone.querySelector(".p-card__content");
  entityCardDescription.innerText = truncateString(entity.description, 200);

  return clone;
}

export default buildTopicCard;
