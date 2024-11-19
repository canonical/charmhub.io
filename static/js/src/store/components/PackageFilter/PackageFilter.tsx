import { Button } from "@canonical/react-components";
import { Filters } from "@canonical/store-components";
import { Category } from "../../types";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import platforms from "../../data/platforms";
import packageTypes from "../../data/package-types";

export const PackageFilter = ({
  data,
  disabled,
}: {
  data?: {
    total_items: number;
    total_pages: number;
    packages: unknown;
    categories: Category[];
  };
  disabled: boolean;
}) => {
  const [hideFilters, setHideFilters] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const onPlatformChange = (item: string) => {
    searchParams.set("platforms", item);
    searchParams.delete("page");
    setSearchParams(searchParams);
  };

  const onPackageTypeChange = (item: string) => {
    searchParams.set("type", item);
    searchParams.delete("page");
    setSearchParams(searchParams);
  };

  const onCategoriesChange = (items: string[]) => {
    if (items.length > 0) {
      searchParams.set("categories", items.join(","));
    } else {
      searchParams.delete("categories");
    }

    searchParams.delete("page");
    setSearchParams(searchParams);
  };

  return (
    <>
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
        role="button"
        tabIndex={0}
        onClick={() => {
          setHideFilters(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setHideFilters(true);
          }
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
            setSelectedCategories={onCategoriesChange}
            platforms={platforms}
            selectedPlatform={searchParams.get("platforms") || "all"}
            setSelectedPlatform={onPlatformChange}
            packageTypes={packageTypes}
            selectedPackageType={searchParams.get("type") || "all"}
            setSelectedPackageType={onPackageTypeChange}
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
};
