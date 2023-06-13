import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { Strip, Row, Col, Pagination } from "@canonical/react-components";
import { CharmCard, Filters } from "@canonical/store-components";

import categories from "../../data/categories";
import platforms from "../../data/platforms";
import packageTypes from "../../data/package-types";

function Packages() {
  const getUpdatedSearchParams = (
    page: number,
    selectedCategories: Array<string>,
    selectedPlatform: string,
    selectedPackageType: string
  ) => {
    const searchParams: any = {};

    if (page && page > 1) {
      searchParams.page = page.toString();
    }

    if (selectedCategories && selectedCategories.length > 0) {
      searchParams.categories = selectedCategories.join(",");
    }

    if (selectedPlatform) {
      searchParams.platforms = selectedPlatform;
    }

    if (selectedPackageType) {
      searchParams.type = selectedPackageType;
    }

    return searchParams;
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

  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("categories")?.split(",") || []
  );

  const [selectedPlatform, setSelectedPlatform] = useState(
    searchParams.get("platforms") || ""
  );

  const [selectedPackageType, setSelectedPackageType] = useState(
    searchParams.get("type") || ""
  );

  const { data, status, refetch } = useQuery("data", getData);

  useEffect(() => {
    refetch();
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage("1");
    setSearchParams(
      getUpdatedSearchParams(
        1,
        selectedCategories,
        selectedPlatform,
        selectedPackageType
      )
    );
  }, [selectedCategories]);

  useEffect(() => {
    setCurrentPage("1");
    setSearchParams(
      getUpdatedSearchParams(
        1,
        selectedCategories,
        selectedPlatform,
        selectedPackageType
      )
    );
  }, [selectedPlatform]);

  useEffect(() => {
    setCurrentPage("1");
    setSearchParams(
      getUpdatedSearchParams(
        1,
        selectedCategories,
        selectedPlatform,
        selectedPackageType
      )
    );
  }, [selectedPackageType]);

  return (
    <Strip>
      <Row>
        <Col size={3}>
          <Filters
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            platforms={platforms}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            packageTypes={packageTypes}
            selectedPackageType={selectedPackageType}
            setSelectedPackageType={setSelectedPackageType}
            disabled={status === "loading"}
          />
        </Col>
        <Col size={9}>
          <Row>
            {status === "loading" && <p>Loading packages...</p>}

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
              <h1 className="p-heading--2">
                No packages match{" "}
                {`${
                  selectedCategories.length > 1
                    ? "these filters"
                    : "this filter"
                }`}
              </h1>
            )}
          </Row>

          {status === "success" && data.packages.length > 0 && (
            <Pagination
              itemsPerPage={12}
              totalItems={data.total_pages}
              paginate={(pageNumber) => {
                setCurrentPage(pageNumber.toString());
                setSearchParams(
                  getUpdatedSearchParams(
                    pageNumber,
                    selectedCategories,
                    selectedPlatform,
                    selectedPackageType
                  )
                );
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
