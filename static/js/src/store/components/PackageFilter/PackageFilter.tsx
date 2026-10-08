import { Button, CheckboxInput, Icon } from "@canonical/react-components";
import { Filters } from "@canonical/store-components";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import platforms from "../../data/platforms";
import type { Category } from "../../types";

export const PackageFilter = ({
  categories,
  disabled,
}: {
  categories: Category[];
  disabled: boolean;
}) => {
  const [hideFilters, setHideFilters] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPlatforms = searchParams.get("platforms")?.split(",") || [];
  const hasFilters = Boolean(
    searchParams.get("platforms") || searchParams.get("categories")
  );

  const onPlatformChange = (platform: string, checked: boolean) => {
    const selected = new Set(selectedPlatforms);
    checked ? selected.add(platform) : selected.delete(platform);
    const params = new URLSearchParams(searchParams);
    const value = platforms
      .filter(({ name }) => selected.has(name))
      .map(({ name }) => name)
      .join(",");
    value ? params.set("platforms", value) : params.delete("platforms");
    params.delete("page");
    setSearchParams(params);
  };

  const onCategoriesChange = (items: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (items.length > 0) {
      params.set("categories", items.join(","));
    } else {
      params.delete("categories");
    }

    params.delete("page");
    setSearchParams(params);
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
          <div className="u-sv3">
            <h2 className="p-muted-heading">Platforms</h2>
            {platforms.map(({ name, display_name }) => (
              <CheckboxInput
                key={name}
                label={display_name}
                checked={selectedPlatforms.includes(name)}
                disabled={disabled}
                onChange={(event) =>
                  onPlatformChange(name, event.target.checked)
                }
              />
            ))}
          </div>
          <div className="u-sv3">
            <Filters
              categories={categories}
              selectedCategories={
                searchParams.get("categories")?.split(",") || []
              }
              setSelectedCategories={onCategoriesChange}
              disabled={disabled}
            />
          </div>
          <div className="u-sv3">
            <Button
              className="u-no-margin--bottom"
              disabled={!hasFilters}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                for (const key of ["platforms", "categories", "page"]) {
                  params.delete(key);
                }
                setSearchParams(params);
              }}
            >
              Clear all filters
            </Button>
          </div>
          <hr />
          <h2 className="p-muted-heading">Developer resources</h2>
          <ul className="p-list u-no-margin--bottom">
            <li className="p-list__item">
              <a href="/integrations">Interfaces</a>
            </li>
            <li className="p-list__item">
              <a href="https://documentation.ubuntu.com/charmlibs/">
                Charm development libraries <Icon name="external-link" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
