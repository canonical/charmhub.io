import { Button, CheckboxInput } from "@canonical/react-components";
import { Filters } from "@canonical/store-components";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import platforms from "../../data/platforms";
import categories from "../../data/categories";

export const PackageFilter = ({ disabled }: { disabled: boolean }) => {
  const [hideFilters, setHideFilters] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPlatforms = searchParams.get("platforms")?.split(",") || [];

  const onPlatformChange = (platform: string, checked: boolean) => {
    const selected = new Set(selectedPlatforms);
    if (checked) selected.add(platform);
    else selected.delete(platform);
    const params = new URLSearchParams(searchParams);
    const value = platforms
      .filter(({ name }) => selected.has(name))
      .map(({ name }) => name)
      .join(",");
    if (value) params.set("platforms", value);
    else params.delete("platforms");
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
          <div className="p-section--shallow">
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
          <Filters
            categories={categories}
            selectedCategories={
              searchParams.get("categories")?.split(",") || []
            }
            setSelectedCategories={onCategoriesChange}
            disabled={disabled}
          />
          <hr />
          <ul className="p-list u-no-margin--bottom">
            <li className="p-list__item">
              <a href="/integrations">Interfaces</a>
            </li>
            <li className="p-list__item">
              <a href="https://documentation.ubuntu.com/charmlibs/">
                Charm development libraries
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
