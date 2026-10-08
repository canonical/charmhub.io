import { useEffect } from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { ITEMS_PER_PAGE, PackageList } from "../../components/PackageList";
import { v4 as uuidv4 } from "uuid";
import { LandingPage } from "../../components/LandingPage";
import { Solution, Store } from "../../types";
import platforms from "../../data/platforms";

function Packages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isLandingPage = searchParams.size === 0;
  const requestedType = searchParams.get("type");
  const listType = requestedType === "solutions" ? "solutions" : "charms";

  useEffect(() => {
    if (!isLandingPage && requestedType !== listType) {
      const params = new URLSearchParams(searchParams);
      params.set("type", listType);
      setSearchParams(params, { replace: true });
    }
  }, [isLandingPage, requestedType, listType, searchParams, setSearchParams]);

  const storeParams = new URLSearchParams(searchParams);
  storeParams.set("type", "charm");
  const selectedPlatforms = platforms
    .filter(({ name }) =>
      searchParams.get("platforms")?.split(",").includes(name)
    )
    .map(({ name }) => name);
  if (selectedPlatforms.length === 1) {
    storeParams.set("platforms", selectedPlatforms[0]);
  } else {
    storeParams.delete("platforms");
  }
  if (listType === "solutions") storeParams.delete("page");
  const storeQuery = isLandingPage ? "?type=charm" : `?${storeParams}`;

  const getData = async () => {
    const response = await fetch(`/store.json${storeQuery}`);
    if (!response.ok) {
      throw new Error("Failed to fetch charms");
    }

    const data = (await response.json()) as Store;
    const packagesWithId = data.packages.map((item) => {
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

  const { data, status, isFetching } = useQuery(["data", storeQuery], getData, {
    keepPreviousData: true,
  });

  const { data: solutions = [], isFetching: areSolutionsFetching } = useQuery(
    "solutions-list",
    async () => {
      const response = await fetch("/solutions.json");
      if (!response.ok) {
        throw new Error("Failed to fetch solutions");
      }
      const result = (await response.json()) as { solutions: Solution[] };
      return result.solutions;
    },
    { enabled: !isLandingPage }
  );

  const selectedCategories = searchParams.get("categories")?.split(",") || [];
  const categories = data?.categories || [];
  const getCategory = (category: Solution["categories"][number]): string =>
    typeof category === "string"
      ? categories.find(
          ({ name, display_name }) =>
            name === category ||
            display_name.toLowerCase() === category.toLowerCase()
        )?.name || category
      : category.slug ||
        getCategory(category.name || category.display_name || "");
  const query = searchParams.get("q")?.trim().toLowerCase();
  const filteredSolutions = solutions.filter((solution) => {
    const matchesSearch =
      !query ||
      [solution.title, solution.publisher, solution.summary].some((value) =>
        (value || "").toLowerCase().includes(query)
      );
    const matchesPlatform =
      selectedPlatforms.length !== 1 ||
      selectedPlatforms.includes(
        solution.platform === "machine" ? "vm" : solution.platform
      );
    const solutionCategories = solution.categories.map(getCategory);
    const matchesCategories =
      selectedCategories.length === 0 ||
      selectedCategories.some((category) =>
        solutionCategories.includes(category)
      );
    return matchesSearch && matchesPlatform && matchesCategories;
  });
  const currentPage = Number(searchParams.get("page") || 1);
  const pagedSolutions = filteredSolutions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE.solutions,
    currentPage * ITEMS_PER_PAGE.solutions
  );
  const charmCount = data?.total_items || 0;

  return isLandingPage ? (
    <LandingPage data={data} isFetching={isFetching} status={status} />
  ) : (
    <PackageList
      type={listType}
      charms={status === "success" ? data.packages : []}
      solutions={pagedSolutions}
      categories={categories}
      counts={{ charms: charmCount, solutions: filteredSolutions.length }}
      countsFetching={{ charms: isFetching, solutions: areSolutionsFetching }}
      totalItems={
        listType === "solutions" ? filteredSolutions.length : charmCount
      }
      resultCount={
        listType === "solutions"
          ? pagedSolutions.length
          : data?.packages.length || 0
      }
      isFetching={listType === "solutions" ? areSolutionsFetching : isFetching}
      showSkeletons={
        listType === "solutions" ? areSolutionsFetching : isFetching
      }
    />
  );
}

export default Packages;
