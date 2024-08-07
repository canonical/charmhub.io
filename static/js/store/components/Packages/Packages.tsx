import { useState, useEffect, useRef } from "react";
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

import platforms from "../../data/platforms";
import packageTypes from "../../data/package-types";

function Packages() {
  const ITEMS_PER_PAGE = 12;

  const getData = async () => {
    const response = await fetch(`/store.json${search}`);
    const data = await response.json();
    const packagesWithId = data.packages.map((item: any) => {
      return {
        ...item,
        id: crypto.randomUUID(),
      };
    });

    return {
      total_items: data.total_items,
      total_pages: data.total_pages,
      packages: packagesWithId,
      categories: data.categories,
    };
  };

  const { search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [hideFilters, setHideFilters] = useState(true);
  const currentPage = searchParams.get("page") || "1";
  const { data, status, refetch, isFetching } = useQuery("data", getData);

  const topicsQuery = searchParams ? searchParams.get("categories") : null;

  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refetch();
  }, [searchParams]);

  const firstResultNumber = (parseInt(currentPage) - 1) * ITEMS_PER_PAGE + 1;
  const lastResultNumber =
    (parseInt(currentPage) - 1) * ITEMS_PER_PAGE + data?.packages.length;

  return (
    <>
      <Banner searchRef={searchRef} searchSummaryRef={searchSummaryRef} />
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
                  categories={data?.categories || []}
                  selectedCategories={
                    searchParams.get("categories")?.split(",") || []
                  }
                  setSelectedCategories={(items: any) => {
                    if (items.length > 0) {
                      searchParams.set("categories", items.join(","));
                    } else {
                      searchParams.delete("categories");
                    }

                    searchParams.delete("page");
                    setSearchParams(searchParams);
                  }}
                  platforms={platforms}
                  selectedPlatform={searchParams.get("platforms") || "all"}
                  setSelectedPlatform={(item: string) => {
                    searchParams.set("platforms", item);
                    searchParams.delete("page");
                    setSearchParams(searchParams);
                  }}
                  packageTypes={packageTypes}
                  selectedPackageType={searchParams.get("type") || "all"}
                  setSelectedPackageType={(item: string) => {
                    searchParams.set("type", item);
                    searchParams.delete("page");
                    setSearchParams(searchParams);
                  }}
                  disabled={isFetching}
                />
              </div>
            </div>
          </Col>
          <Col size={9}>
            <Topics topicsQuery={topicsQuery} />
            {data?.packages && data?.packages.length > 0 && (
              <div className="u-fixed-width" ref={searchSummaryRef}>
                {searchParams.get("q") ? (
                  <p>
                    Showing {currentPage === "1" ? "1" : firstResultNumber} to{" "}
                    {lastResultNumber} of {data?.total_items} results for{" "}
                    <strong>"{searchParams.get("q")}"</strong>.{" "}
                    <Button
                      appearance="link"
                      onClick={() => {
                        searchParams.delete("q");
                        searchParams.delete("page");
                        setSearchParams(searchParams);

                        if (searchRef.current) {
                          searchRef.current.value = "";
                        }
                      }}
                    >
                      Clear search
                    </Button>
                  </p>
                ) : (
                  <p>
                    Showing {currentPage === "1" ? "1" : firstResultNumber} to{" "}
                    {lastResultNumber} of {data?.total_items} items
                  </p>
                )}
              </div>
            )}
            <Row>
              {isFetching &&
                [...Array(ITEMS_PER_PAGE)].map((_item, index) => (
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
                totalItems={data.total_items}
                paginate={(pageNumber) => {
                  searchParams.set("page", pageNumber.toString());
                  setSearchParams(searchParams);
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
