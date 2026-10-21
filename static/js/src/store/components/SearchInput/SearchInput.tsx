import { Button } from "@canonical/react-components";
import { RefObject, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

type Props = {
  searchRef: RefObject<HTMLInputElement>;
};

export const SearchInput = ({ searchRef }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (searchRef.current) searchRef.current.value = query;
  }, [query, searchRef]);

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    if (value) params.set("q", value);
    else params.delete("q");
    if (searchRef.current) searchRef.current.value = value;
    setSearchParams(params);
  };

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateSearch(searchRef.current?.value.trim() || "");
  };

  return (
    <form className="p-search-box" onSubmit={onSearch}>
      <label className="u-off-screen" htmlFor="search">
        Search Solutions or Charms
      </label>
      <input
        type="search"
        id="search"
        className="p-search-box__input"
        name="q"
        placeholder="Search Solutions or Charms"
        defaultValue={query}
        ref={searchRef}
      />
      <Button
        type="button"
        className="p-search-box__reset"
        onClick={() => updateSearch("")}
      >
        <i className="p-icon--close">Close</i>
      </Button>
      <Button type="submit" className="p-search-box__button">
        <i className="p-icon--search">Search</i>
      </Button>
    </form>
  );
};
