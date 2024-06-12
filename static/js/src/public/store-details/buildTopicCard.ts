import { truncateString } from "../../libs/truncate-string";

function buildTopicCard(entity: {slug: string, name: string, description: string}) {
  const template = document.getElementById("topic-card-template") as HTMLTemplateElement;
  const clone = template.content.cloneNode(true) as HTMLElement;

  const entityCardContainer = clone.querySelector("[data-js='topic-card']") as HTMLElement;
  entityCardContainer.id = entity.slug;

  const entityCard = clone.querySelector("a.p-card--href") as HTMLAnchorElement;
  entityCard.href = `/topics/${entity.slug}`;

  const entityCardTitle = clone.querySelector("h3.p-muted-heading") as HTMLElement;
  entityCardTitle.innerText = entity.name;

  const entityCardDescription = clone.querySelector(".p-card__content") as HTMLElement;
  entityCardDescription.innerText = truncateString(entity.description, 200);

  return clone;
}

export default buildTopicCard;
