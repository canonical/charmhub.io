import { useRef } from "react";
import { Link, LinkProps, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Col,
  Icon,
  Pagination,
  Row,
  Strip,
  Tabs,
} from "@canonical/react-components";
import {
  CharmCard,
  LoadingCard,
  SolutionCard,
  SolutionLoadingCard,
} from "@canonical/store-components";

import { Solution, Store } from "../../types";
import { PackageFilter } from "../PackageFilter";
import { SearchInput } from "../SearchInput";

export const ITEMS_PER_PAGE = { charms: 12, solutions: 5 };

type Props = {
  type: "solutions" | "charms";
  charms: Store["packages"];
  solutions: Solution[];
  categories: Store["categories"];
  counts: { charms: number; solutions: number };
  countsFetching: { charms: boolean; solutions: boolean };
  countsReady: boolean;
  totalItems: number;
  resultCount: number;
  isFetching: boolean;
  showSkeletons: boolean;
};

export const PackageList = ({
  type,
  charms,
  solutions,
  categories,
  counts,
  countsFetching,
  countsReady,
  totalItems,
  resultCount,
  isFetching,
  showSkeletons,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const currentPage = Number(searchParams.get("page") || 1);
  const itemsPerPage = ITEMS_PER_PAGE[type];
  const query = searchParams.get("q")?.trim();
  const categoryCount =
    searchParams.get("categories")?.split(",").filter(Boolean).length || 0;
  const platformCount =
    searchParams.get("platforms")?.split(",").filter(Boolean).length || 0;
  const hasFilters = categoryCount + platformCount > 0;
  const otherType = type === "solutions" ? "charms" : "solutions";
  const otherCount = counts[otherType];
  const loadingRelatedCharms =
    type === "solutions" && !countsFetching.solutions && countsFetching.charms;
  const showFallback =
    (countsReady || loadingRelatedCharms) &&
    !isFetching &&
    !showSkeletons &&
    !countsFetching[type] &&
    (!countsFetching[otherType] || loadingRelatedCharms) &&
    totalItems === 0;
  const filterCount = categoryCount + platformCount;
  const filterLabel =
    categoryCount && platformCount
      ? "filters"
      : categoryCount
        ? categoryCount === 1
          ? "category"
          : "categories"
        : platformCount === 1
          ? "platform"
          : "platforms";
  const summaryContext =
    query && !hasFilters
      ? query
      : !query && hasFilters
        ? `${filterCount} ${filterLabel}`
        : "";

  const renderCount = (tabType: Props["type"]) =>
    countsFetching[tabType] ? (
      <span
        className="u-vertically-center"
        role="status"
        aria-label={`Loading ${tabType} count`}
      >
        <Icon name="spinner" className="u-animation--spin" aria-hidden="true" />
      </span>
    ) : (
      <Badge value={counts[tabType]} />
    );

  const getTabLink = (tabType: Props["type"]) => {
    const params = new URLSearchParams({ type: tabType });
    const platforms = searchParams.get("platforms");
    if (platforms) params.set("platforms", platforms);
    const categories = searchParams.get("categories");
    if (categories) params.set("categories", categories);
    const query = searchParams.get("q");
    if (query) params.set("q", query);
    return `/?${params}`;
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams);
    for (const key of ["q", "page", "platforms", "categories"]) {
      params.delete(key);
    }
    setSearchParams(params);
  };

  return (
    <Strip shallow className="u-no-padding--bottom">
      <Row className="p-section--deep">
        <Col size={3}>
          <PackageFilter categories={categories} disabled={isFetching} />
        </Col>
        <Col size={9}>
          <SearchInput
            searchRef={searchRef as React.RefObject<HTMLInputElement>}
          />
          <div className="u-sv2">
            <Tabs<LinkProps>
              listClassName="u-no-margin--bottom"
              links={[
                {
                  active: type === "solutions",
                  component: Link,
                  to: getTabLink("solutions"),
                  label: <>Solutions {renderCount("solutions")}</>,
                },
                {
                  active: type === "charms",
                  component: Link,
                  to: getTabLink("charms"),
                  label: <>Charms {renderCount("charms")}</>,
                },
              ]}
            />
          </div>
          {isFetching && <p>Loading results...</p>}
          {!isFetching && totalItems > 0 && (
            <div className="u-sv2">
              <div className="p-inline-list--stretch">
                <p className="u-truncate u-no-margin--bottom">
                  Showing {resultCount}{" "}
                  {resultCount === 1 ? "result" : "results"} of {counts[type]}
                  {summaryContext && (
                    <>
                      {" "}
                      for <strong>{summaryContext}</strong>
                    </>
                  )}
                </p>
                {query && (
                  <>
                    &nbsp;
                    <Button
                      appearance="link"
                      className="u-no-margin--bottom"
                      onClick={clearSearch}
                    >
                      {hasFilters ? "Clear search & filter" : "Clear search"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
          {showSkeletons &&
            type === "solutions" &&
            [...Array(itemsPerPage)].map((_item, index) => (
              <Row key={index}>
                <Col size={9} style={{ marginBottom: "1.5rem" }}>
                  <SolutionLoadingCard />
                </Col>
              </Row>
            ))}
          {showSkeletons && type === "charms" && (
            <Row>
              {[...Array(itemsPerPage)].map((_item, index) => (
                <Col size={3} key={index} style={{ marginBottom: "1.5rem" }}>
                  <LoadingCard />
                </Col>
              ))}
            </Row>
          )}
          {!showSkeletons &&
            type === "solutions" &&
            solutions.map((solution) => (
              <Row key={solution.name}>
                <Col size={9} style={{ marginBottom: "1.5rem" }}>
                  <SolutionCard
                    charmIcons={solution.charm_icons}
                    data={solution}
                  />
                </Col>
              </Row>
            ))}
          {!showSkeletons && type === "charms" && (
            <Row>
              {charms.map((charm) => (
                <Col key={charm.id} size={3} style={{ marginBottom: "1.5rem" }}>
                  <CharmCard data={charm} />
                </Col>
              ))}
            </Row>
          )}
          {showFallback && (
            <Row>
              <Col size={6}>
                <h2 className="p-heading--4 u-no-padding u-no-margin u-sv1">
                  No {type} found
                </h2>
                <p className="u-no-padding u-no-margin u-sv3">
                  {loadingRelatedCharms ? (
                    <>
                      There are no available solutions in Charmhub related to
                      your current search.
                    </>
                  ) : query && !hasFilters ? (
                    <>
                      Your current search for <strong>{query}</strong> doesn't
                      match any {type}
                      {otherCount > 0
                        ? ` in Charmhub, but we found ${otherType} matching your search.`
                        : ` or ${otherType} in Charmhub.`}
                    </>
                  ) : otherCount > 0 ? (
                    <>
                      There are no available {type} in Charmhub related to your
                      current search.
                    </>
                  ) : (
                    <>
                      There are no {type} or {otherType} in Charmhub related to
                      your current search.
                    </>
                  )}
                </p>
                <div className="p-cta-block">
                  {loadingRelatedCharms ? (
                    <Button
                      appearance="positive"
                      className="u-no-margin--bottom"
                      disabled
                      aria-busy="true"
                    >
                      Looking for charms
                    </Button>
                  ) : (
                    <Button<LinkProps>
                      element={Link}
                      appearance="positive"
                      className="u-no-margin--bottom"
                      to={
                        otherCount > 0
                          ? getTabLink(otherType)
                          : `/?type=${type}`
                      }
                    >
                      {otherCount > 0
                        ? `Explore ${otherCount} related ${otherCount === 1 ? otherType.slice(0, -1) : otherType}`
                        : `Browse all ${type}`}
                    </Button>
                  )}
                  {(loadingRelatedCharms || otherCount > 0) && hasFilters && (
                    <Button
                      className="u-no-margin--bottom"
                      onClick={clearSearch}
                    >
                      {query ? "Clear search & filters" : "Clear all filters"}
                    </Button>
                  )}
                </div>
                {type === "charms" && (
                  <>
                    <div className="u-sv3">
                      <hr className="u-no-margin" />
                    </div>
                    <h3 className="p-muted-heading u-no-padding--top">
                      Publish to Charmhub
                    </h3>
                    <Row>
                      <Col size={5}>
                        <ul className="p-list--divided u-no-margin--bottom">
                          <li className="p-list__item has-bullet">
                            Have a charm ready?{" "}
                            <a href="https://charmhub.io/charms">
                              Publish it to Charmhub
                            </a>{" "}
                            for others to find
                          </li>
                          <li className="p-list__item has-bullet">
                            Just getting started? Read the{" "}
                            <a href="https://canonical.com/juju/docs">
                              Juju docs
                            </a>{" "}
                            for an introduction to charming and deployments on
                            Juju
                          </li>
                          <li className="p-list__item has-bullet">
                            Want to build a charm? Learn{" "}
                            <a href="https://canonical.com/juju/docs/ops/latest/#get-started">
                              Ops
                            </a>{" "}
                            to charm any app, or use{" "}
                            <a href="https://canonical.com/juju/docs/charmcraft/latest/tutorial/">
                              Charmcraft
                            </a>{" "}
                            for 12-factor applications
                          </li>
                        </ul>
                      </Col>
                    </Row>
                  </>
                )}
              </Col>
            </Row>
          )}
          {!isFetching && totalItems > 0 && resultCount === 0 && (
            <p>No results found.</p>
          )}
          {!showSkeletons && resultCount > 0 && (
            <Pagination
              centered={false}
              className="p-pagination u-float-right"
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              paginate={(pageNumber) => {
                searchParams.set("page", pageNumber.toString());
                setSearchParams(searchParams);
              }}
              scrollToTop
              totalItems={totalItems}
            />
          )}
        </Col>
      </Row>
    </Strip>
  );
};
