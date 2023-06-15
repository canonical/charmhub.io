import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Strip,
  Row,
  Col,
  Button,
  MainTable,
  Notification,
  Pagination,
  StatusLabel,
} from "@canonical/react-components";

import type { InterfaceItem } from "../../types";

function pageArray(items: Array<any>, count: number) {
  const result: Array<any> = [];

  for (let i = 0; i < Math.ceil(items.length / count); i++) {
    const start = i * count;
    const end = start + count;

    result.push(items.slice(start, end));
  }

  return result;
}

function sortInterfaces(a: InterfaceItem, b: InterfaceItem) {
  if (a.status === "Live" && b.status !== "Live") {
    return -1;
  }

  if (a.status !== "Live" && b.status === "Live") {
    return 1;
  }

  return 0;
}

type Props = {
  interfacesList: Array<InterfaceItem>;
};

function InterfacesIndex({ interfacesList }: Props) {
  const ITEMS_PER_PAGE = 10;

  const [searchParams, setSearchParams]: [URLSearchParams, Function] =
    useSearchParams();

  const [interfaces, setInterfaces] = useState<Array<InterfaceItem>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(
    currentPageNumber - 1
  );

  const pageParam = searchParams.get("page");

  useEffect(() => {
    if (pageParam !== null) {
      setCurrentPageNumber(parseInt(pageParam));
      setCurrentPageIndex(parseInt(pageParam) - 1);
    } else {
      setCurrentPageNumber(1);
      setCurrentPageIndex(0);
    }
  }, [pageParam]);

  useEffect(() => {
    if (interfacesList) {
      setInterfaces(interfacesList.sort(sortInterfaces));
      return;
    }

    setLoading(true);

    fetch("./interfaces.json")
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }

        throw response;
      })
      .then((data) => {
        setInterfaces(data?.interfaces.sort(sortInterfaces));
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [interfacesList]);

  useEffect(() => {
    setCurrentItems(pageArray(interfaces, ITEMS_PER_PAGE)[currentPageIndex]);
  }, [currentPageIndex, interfaces]);

  useEffect(() => {
    document.title = "Charmhub | Interface catalogue";
  }, []);

  return (
    <>
      <Strip type="light">
        <Row>
          <Col size={4}>
            <h1>Interfaces</h1>
          </Col>
          <Col size={8}>
            <p>
              Interfaces describe the relation between two charms. This
              interface catalogue shows opinionated, standardized interface
              specifications for charm relations. Each interface
              outlines the behavior and requirements of charms relating to one
              another.
            </p>
            <p>
              Most of the content of these pages can be collaboratively
              discussed and changed. You can help us improve these pages by
              clicking the button below.
            </p>
            <p className="u-no-margin--bottom">
              <Button
                element="a"
                href="https://github.com/canonical/charm-relation-interfaces"
                appearance="positive"
              >
                Contribute
              </Button>
            </p>
          </Col>
        </Row>
      </Strip>
      <Strip>
        {error && (
          <Notification
            severity="negative"
            title="Error"
            onDismiss={() => {
              setError(false);
            }}
          >
            There was a problem fetching interfaces. Please try again in a few
            moments.
          </Notification>
        )}
        <h2 className="p-heading--4">
          {currentItems && interfaces.length > ITEMS_PER_PAGE && (
            <>
              {ITEMS_PER_PAGE * currentPageIndex + 1} &ndash;{" "}
              {ITEMS_PER_PAGE * currentPageIndex + currentItems.length} of{" "}
              {interfaces.length} interfaces
            </>
          )}
        </h2>
        <MainTable
          headers={[
            {
              content: "Interface name",
              heading: "Interface name",
              style: {
                width: "25%",
              },
            },
            {
              content: "Version",
              heading: "Version",
              style: {
                width: "80px",
              },
            },
            {
              content: "Category",
              heading: "Category",
            },
            {
              content: "Overview",
              heading: "Overview",
              style: {
                width: "45%",
              },
            },
          ]}
          rows={
            currentItems &&
            currentItems.map((item: InterfaceItem) => {
              return {
                columns: [
                  {
                    content: (
                      <div
                        style={{
                          display: "flex",
                        }}
                      >
                        {item?.status === "Live" && (
                          <Link to={`/interfaces/${item?.name}`}>
                            {item?.name}
                          </Link>
                        )}
                        {item?.status !== "Live" && (
                          <>
                            <StatusLabel style={{ marginRight: "1rem" }}>
                              {item?.status}
                            </StatusLabel>
                            <Link
                              to={`/interfaces/${
                                item?.name
                              }/${item?.status.toLowerCase()}`}
                            >
                              {item?.name}
                            </Link>
                          </>
                        )}
                      </div>
                    ),
                  },
                  {
                    content: item?.version,
                    className: "u-align--right",
                  },
                  {
                    content: item?.category,
                  },
                  {
                    content: item?.description.split(".")[0],
                  },
                ],
              };
            })
          }
          emptyStateMsg={`${
            loading ? "Fetching interfaces..." : "No interfaces available"
          }`}
          responsive
        />
        <div className="u-align--right">
          <Pagination
            currentPage={currentPageNumber}
            itemsPerPage={ITEMS_PER_PAGE}
            paginate={(pageNumber) => {
              setCurrentPageNumber(pageNumber);
              setCurrentPageIndex(pageNumber - 1);

              if (pageNumber > 1) {
                setSearchParams({ page: pageNumber });
              } else {
                setSearchParams({});
              }
            }}
            totalItems={interfaces.length}
            scrollToTop
          />
        </div>
      </Strip>
    </>
  );
}

export default InterfacesIndex;
