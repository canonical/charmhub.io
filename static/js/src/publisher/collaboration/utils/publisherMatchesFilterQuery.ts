import type { Publisher } from "../types";

function publisherMatchesFilterQuery(
  publisher: Publisher,
  filterQuery: string
) {
  if (!publisher || !filterQuery) {
    return false;
  }

  return (
    publisher?.["display-name"]?.includes(filterQuery) ||
    publisher?.email?.includes(filterQuery)
  );
}

export default publisherMatchesFilterQuery;
