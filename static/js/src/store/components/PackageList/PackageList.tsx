import { useRef } from "react";
import { Link, LinkProps, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Col,
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
  counts: { charms: number; solutions: number };
  totalItems: number;
  resultCount: number;
  isFetching: boolean;
  showSkeletons: boolean;
};

export const PackageList = ({
  type,
  charms,
  solutions,
  counts,
  totalItems,
  resultCount,
  isFetching,
  showSkeletons,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const currentPage = Number(searchParams.get("page") || 1);
  const itemsPerPage = ITEMS_PER_PAGE[type];

  const getTabLink = (tabType: Props["type"]) => {
    const params = new URLSearchParams({ type: tabType });
    const platforms = searchParams.get("platforms");
    if (platforms) params.set("platforms", platforms);
    const categories = searchParams.get("categories");
    if (categories) params.set("categories", categories);
    return `/?${params}`;
  };

  const clearSearch = () => {
    searchParams.delete("q");
    searchParams.delete("page");
    setSearchParams(searchParams);
    if (searchRef.current) searchRef.current.value = "";
  };

  return (
    <Strip shallow className="u-no-padding--bottom">
      <Row className="p-section--deep">
        <Col size={3}>
          <PackageFilter disabled={isFetching} />
        </Col>
        <Col size={9}>
          <SearchInput
            searchRef={searchRef as React.RefObject<HTMLInputElement>}
          />
          <Tabs<LinkProps>
            links={[
              {
                active: type === "solutions",
                component: Link,
                to: getTabLink("solutions"),
                label: (
                  <>
                    Solutions <Badge value={counts.solutions} />
                  </>
                ),
              },
              {
                active: type === "charms",
                component: Link,
                to: getTabLink("charms"),
                label: (
                  <>
                    Charms <Badge value={counts.charms} />
                  </>
                ),
              },
            ]}
          />
          {isFetching && <p>Loading results...</p>}
          {!isFetching && (
            <p>
              Showing {resultCount} results of {counts[type]}
              {searchParams.get("q") && (
                <>
                  {" "}
                  <Button appearance="link" onClick={clearSearch}>
                    Clear search
                  </Button>
                </>
              )}
            </p>
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
          {!isFetching && resultCount === 0 && <p>No results found.</p>}
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
