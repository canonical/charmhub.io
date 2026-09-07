import { useEffect } from "react";
import { useQuery } from "react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { PackageList } from "../../components/PackageList/PackageList";
import { v4 as uuidv4 } from "uuid";
import { EmptyResultSection } from "../../components/EmptyResultSection";
import { LandingPage } from "../../components/LandingPage";

function Packages() {
  const { search } = useLocation();
  const [searchParams] = useSearchParams();
  const isLandingPage = searchParams.size === 0;

  const getData = async () => {
    const query = isLandingPage ? "?type=charm" : search;
    const response = await fetch(`/store.json${query}`);
    if (!response.ok) {
      throw new Error("Failed to fetch charms");
    }

    const data = await response.json();
    const packagesWithId = data.packages.map((item: string[]) => {
      return {
        ...item,
        id: uuidv4(),
      };
    });

    return {
      total_items: data.total_items,
      total_pages: data.total_pages,
      packages: packagesWithId,
      categories: data.categories,
    };
  };

  const { data, status, refetch, isFetching } = useQuery(
    ["data", search],
    getData
  );

  useEffect(() => {
    refetch();
  }, [searchParams]);

  const isResultEmpty = data && data.packages.length === 0;

  return (
    <>
      {isLandingPage ? (
        <LandingPage data={data} isFetching={isFetching} status={status} />
      ) : isResultEmpty ? (
        <EmptyResultSection
          isFetching={isFetching}
          searchTerm={searchParams.get("q")}
          data={data}
        />
      ) : (
        <PackageList isFetching={isFetching} status={status} data={data} />
      )}
    </>
  );
}

export default Packages;
