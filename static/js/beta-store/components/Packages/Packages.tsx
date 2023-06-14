import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { Strip, Row, Col, Pagination } from "@canonical/react-components";
import { CharmCard, Filters, LoadingCard } from "@canonical/store-components";

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

  const [currentPage, setCurrentPage] = useState(
    searchParams.get("page") || "1"
  );

  const { data, status, refetch, isFetching } = useQuery("data", getData);

  useEffect(() => {
    refetch();
  }, [searchParams]);

  return (
    <Strip>
      <Row>
        <Col size={3}>
          <Filters
            categories={categories}
            selectedCategories={
              searchParams.get("categories")?.split(",") || []
            }
            setSelectedCategories={(items: any) => {
              if (items.length < 1) {
                setSearchParams(
                  getCurrentSearchParams(searchParams, ["categories", "page"])
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
        </Col>
        <Col size={9}>
          <Row>
            {isFetching &&
              [...Array(ITEMS_PER_PAGE)].map((item, index) => (
                <Col size={3} key={index}>
                  <LoadingCard />
                </Col>
              ))}

            {status === "success" &&
              data.packages.length > 0 &&
              data.packages.map((packageData: any) => (
                <Col
                  size={3}
                  style={{ marginBottom: "1.5rem" }}
                  key={packageData.id}
                >
                  <CharmCard data={packageData} />
                </Col>
              ))}

            {status === "success" && data.packages.length === 0 && (
              <h1 className="p-heading--2">No packages match this filter</h1>
            )}
          </Row>

          {status === "success" && data.packages.length > 0 && (
            <Pagination
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={data.total_pages}
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
  );
}

export default Packages;
