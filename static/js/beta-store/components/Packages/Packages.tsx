import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Strip,
  Row,
  Col,
  Pagination,
  Button,
} from "@canonical/react-components";
import {
  CharmCard,
  BundleCard,
  Filters,
  LoadingCard,
} from "@canonical/store-components";

import Banner from "../Banner";
import Topics from "../Topics";

import categories from "../../data/categories";
import platforms from "../../data/platforms";
import packageTypes from "../../data/package-types";

function Packages() {
  const ITEMS_PER_PAGE = 12;

  const getCurrentSearchParams = (
    searchParams: { get: Function },
    keysToRemove?: Array<string>
  ) => {
    const currentSearchParams: any = {};

    if (searchParams.get("page") && !keysToRemove?.includes("page")) {
      currentSearchParams.page = searchParams.get("page");
    }

    if (
      searchParams.get("categories") &&
      !keysToRemove?.includes("categories")
    ) {
      currentSearchParams.categories = searchParams.get("categories");
    }

    if (searchParams.get("platforms") && keysToRemove?.includes("platforms")) {
      currentSearchParams.platforms = searchParams.get("platforms");
    }

    if (searchParams.get("type") && keysToRemove?.includes("type")) {
      currentSearchParams.type = searchParams.get("type");
    }

    if (searchParams.get("q") && !keysToRemove?.includes("q")) {
      currentSearchParams.q = searchParams.get("q");
    }

    return currentSearchParams;
  };

  const getData = async () => {
    const response = await fetch(`/beta/store.json${search}`);
    const data = await response.json();
    const packagesWithId = data.packages.map((item: any) => {
      return {
        ...item,
        id: crypto.randomUUID(),
      };
    });

    return {
      total_pages: data.total_pages,
      packages: packagesWithId,
      categories: data.categories,
    };
  };

  const { search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [hideFilters, setHideFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    searchParams.get("page") || "1"
  );

  const { data, status, refetch, isFetching } = useQuery("data", getData);

  const topicsQuery = searchParams ? searchParams.get("categories") : null;

  useEffect(() => {
    refetch();
  }, [searchParams]);

  return (
    <>
      <Banner />
      <Strip>
        <Row>
          <Col size={3}>
            <Button
              className="has-icon u-hide--large p-filter-panel__toggle"
              onClick={() => {
                setHideFilters(false);
              }}
            >
              <i className="p-icon--arrow-right"></i>
              <span>Filters</span>
            </Button>
            <div
              className={`p-filter-panel-overlay u-hide--large ${
                hideFilters ? "u-hide--small u-hide--medium" : ""
              }`}
              onClick={() => {
                setHideFilters(true);
              }}
            ></div>

            <div
              className={`p-filter-panel ${
                !hideFilters ? "p-filter-panel--expanded" : ""
              }`}
            >
              <div className="p-filter-panel__header">
                <Button
                  className="has-icon u-hide--large u-no-margin--bottom u-no-padding--left"
                  appearance="base"
                  onClick={() => {
                    setHideFilters(true);
                  }}
                >
                  <i className="p-icon--chevron-down"></i>
                  <span>Hide filters</span>
                </Button>
              </div>

              <div className="p-filter-panel__inner">
                <Filters
                  categories={categories}
                  selectedCategories={
                    searchParams.get("categories")?.split(",") || []
                  }
                  setSelectedCategories={(items: any) => {
                    if (items.length < 1) {
                      setSearchParams(
                        getCurrentSearchParams(searchParams, [
                          "categories",
                          "page",
                        ])
                      );
                    } else {
                      setSearchParams({
                        ...getCurrentSearchParams(searchParams, ["page"]),
                        categories: items.join(","),
                      });
                    }
                  }}
                  platforms={platforms}
                  selectedPlatform={searchParams.get("platforms") || "all"}
                  setSelectedPlatform={(item: string) => {
                    setSearchParams({
                      ...getCurrentSearchParams(searchParams, ["page"]),
                      platforms: item,
                    });
                  }}
                  packageTypes={packageTypes}
                  selectedPackageType={searchParams.get("type") || "all"}
                  setSelectedPackageType={(item: string) => {
                    setSearchParams({
                      ...getCurrentSearchParams(searchParams, ["page"]),
                      type: item,
                    });
                  }}
                  disabled={isFetching}
                />
              </div>
            </div>
          </Col>
          <Col size={9}>
            <Topics topicsQuery={topicsQuery} />
            <Row>
              {isFetching &&
                [...Array(ITEMS_PER_PAGE)].map((item, index) => (
                  <Col size={3} key={index}>
                    <LoadingCard />
                  </Col>
                ))}

              {!isFetching &&
                status === "success" &&
                data.packages.length > 0 &&
                data.packages.map((packageData: any) => (
                  <Col
                    size={3}
                    style={{ marginBottom: "1.5rem" }}
                    key={packageData.id}
                  >
                    {packageData.package.type === "bundle" ? (
                      <BundleCard data={packageData} />
                    ) : (
                      <CharmCard data={packageData} />
                    )}
                  </Col>
                ))}

              {status === "success" && data.packages.length === 0 && (
                <h1 className="p-heading--2">No packages match this filter</h1>
              )}
            </Row>

            {status === "success" && data.packages.length > 0 && (
              <Pagination
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={ITEMS_PER_PAGE * data.total_pages}
                paginate={(pageNumber) => {
                  setCurrentPage(pageNumber.toString());
                  setSearchParams({
                    ...getCurrentSearchParams(searchParams),
                    page: pageNumber.toString(),
                  });
                }}
                currentPage={parseInt(currentPage)}
                centered
                scrollToTop
              />
            )}
          </Col>
        </Row>
      </Strip>
    </>
  );
}

export default Packages;
