import { Button } from "@canonical/react-components";
import { RefObject } from "react";
import { useSearchParams } from "react-router-dom";

type Props = {
  searchRef: RefObject<HTMLInputElement>;
  searchSummaryRef?: RefObject<HTMLDivElement>;
};

export const SearchInput = ({ searchRef, searchSummaryRef }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchRef?.current && searchRef.current.value) {
      searchParams.delete("page");
      searchParams.set("q", searchRef.current.value);
      setSearchParams(searchParams);
    }

    if (searchSummaryRef && searchSummaryRef.current) {
      searchSummaryRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <form className="p-search-box" onSubmit={onSearch}>
      <label className="u-off-screen" htmlFor="search">
        Search Charmhub
      </label>
      <input
        type="search"
        id="search"
        className="p-search-box__input"
        name="q"
        placeholder="Search Charmhub"
        defaultValue={searchParams.get("q") || ""}
        ref={searchRef}
      />
      <Button
        type="reset"
        className="p-search-box__reset"
        onClick={() => {
          searchParams.delete("q");
          setSearchParams(searchParams);
        }}
      >
        <i className="p-icon--close">Close</i>
      </Button>
      <Button type="submit" className="p-search-box__button">
        <i className="p-icon--search">Search</i>
      </Button>
    </form>
  );
};
