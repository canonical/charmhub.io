import React from "react";
import { useSearchParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { Button, Icon } from "@canonical/react-components";

import { filterQueryState } from "../atoms";

function CollaboratorFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const setFilterQuery = useSetRecoilState(filterQueryState);

  return (
    <div className="p-search-box">
      <label className="u-off-screen" htmlFor="search">
        Search collaborators
      </label>
      <input
        required
        type="search"
        id="search"
        name="search"
        className="p-search-box__input"
        placeholder="Search collaborators"
        autoComplete="off"
        value={searchParams.get("filter") || ""}
        onChange={(e) => {
          if (e.target.value) {
            setSearchParams({ filter: e.target.value });
            setFilterQuery(e.target.value);
          } else {
            setSearchParams();
            setFilterQuery("");
          }
        }}
      />
      <Button
        type="reset"
        className="p-search-box__reset"
        onClick={() => {
          setSearchParams();
          setFilterQuery("");
        }}
      >
        <Icon name="close">Clear filter</Icon>
      </Button>
      <Button type="submit" className="p-search-box__button">
        <Icon name="search">Search</Icon>
      </Button>
    </div>
  );
}

export default CollaboratorFilter;
