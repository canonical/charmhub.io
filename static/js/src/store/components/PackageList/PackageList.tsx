import {
  Button,
  Col,
  Pagination,
  Row,
  Strip,
} from "@canonical/react-components";
import Banner from "../Banner";
import { PackageFilter } from "../PackageFilter";
import Topics from "../Topics";
import {
  BundleCard,
  CharmCard,
  LoadingCard,
} from "@canonical/store-components";
import { useSearchParams } from "react-router-dom";
import { useRef } from "react";

import { Store } from "../../types";

const ITEMS_PER_PAGE = 12;

export const PackageList = ({
  isFetching,
  data,
  status,
}: {
  isFetching: boolean;
  status: "success" | "idle" | "error" | "loading";
  data?: Store;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const topicsQuery = searchParams ? searchParams.get("categories") : null;

  const searchRef = useRef<HTMLInputElement | null>(null);

  const currentPage = searchParams.get("page") || "1";
  const firstResultNumber = (parseInt(currentPage) - 1) * ITEMS_PER_PAGE + 1;
  const lastResultNumber =
    (parseInt(currentPage) - 1) * ITEMS_PER_PAGE +
    (data ? data.packages.length : 0);

  const onClear = () => {
    searchParams.delete("q");
    searchParams.delete("page");
    setSearchParams(searchParams);

    if (searchRef.current) {
      searchRef.current.value = "";
    }
  };

  return (
    <>
      <Banner searchRef={searchRef} />
      <Strip>
        <Row>
          <Col size={3}>
            <PackageFilter disabled={isFetching} data={data} />
          </Col>
          <Col size={9}>
            <Topics topicsQuery={topicsQuery} />
            {data && (
              <div className="u-fixed-width">
                {searchParams.get("q") ? (
                  <p>
                    Showing {currentPage === "1" ? "1" : firstResultNumber} to{" "}
                    {lastResultNumber} of {data.total_items} results for{" "}
                    <strong>"{searchParams.get("q")}"</strong>.{" "}
                    <Button appearance="link" onClick={onClear}>
                      Clear search
                    </Button>
                  </p>
                ) : (
                  <p>
                    Showing {currentPage === "1" ? "1" : firstResultNumber} to{" "}
                    {lastResultNumber} of {data.total_items} items
                  </p>
                )}
              </div>
            )}
            <Row>
              {isFetching &&
                [...Array(ITEMS_PER_PAGE)].map((_item, index) => (
                  <Col size={3} key={index}>
                    <LoadingCard />
                  </Col>
                ))}

              {!isFetching &&
                status === "success" &&
                data &&
                data.packages.map((packageData) => (
                  <Col
                    size={3}
                    style={{ marginBottom: "1.5rem" }}
                    key={packageData.id}
                  >
                    {packageData.package.type === "bundle" ? (
                      <BundleCard data={packageData} />
                    ) : (
                      <CharmCard data={packageData} />
                    )}
                  </Col>
                ))}
            </Row>

            {status === "success" && data && (
              <Pagination
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={data.total_items}
                paginate={(pageNumber) => {
                  searchParams.set("page", pageNumber.toString());
                  setSearchParams(searchParams);
                }}
                currentPage={parseInt(currentPage)}
                centered
                scrollToTop
              />
            )}
          </Col>
        </Row>
      </Strip>
    </>
  );
};
