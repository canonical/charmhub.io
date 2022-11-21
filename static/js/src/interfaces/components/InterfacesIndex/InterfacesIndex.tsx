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
} from "@canonical/react-components";

type InterfaceData = {
  name: String;
  description: String;
};

function pageArray(items: Array<any>, count: number) {
  const result: Array<any> = [];

  for (let i = 0; i < Math.ceil(items.length / count); i++) {
    const start = i * count;
    const end = start + count;

    result.push(items.slice(start, end));
  }

  return result;
}

function InterfacesIndex() {
  const ITEMS_PER_PAGE = 10;

  const [searchParams, setSearchParams]: [URLSearchParams, Function] =
    useSearchParams();

  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(currentPageNumber);

  useEffect(() => {
    setLoading(true);

    fetch("./interfaces.json")
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }

        throw response;
      })
      .then((data) => {
        setInterfaces(data?.interfaces);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSearchParams({ page: currentPageNumber });
    setCurrentPageIndex(currentPageNumber - 1);
  }, [currentPageNumber]);

  useEffect(() => {
    setCurrentItems(pageArray(interfaces, ITEMS_PER_PAGE)[currentPageIndex]);
  }, [currentPageIndex, interfaces]);

  return (
    <>
      <Strip type="light">
        <Row>
          <Col size={4}>
            <h1>Interfaces</h1>
          </Col>
          <Col size={8}>
            <p>
              Most of the content of these pages can be collaboratively
              discussed and changed. Help us improve these pages by clicking the
              button below.
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
              content: "Overview",
              heading: "Overview",
              style: {
                width: "40%",
              },
            },
            {
              content: "Tested provider charms",
              heading: "Tested provider charms",
            },
            {
              content: "Tested requirer charms",
              heading: "Tested requirer charms",
            },
          ]}
          rows={
            currentItems &&
            currentItems.map((item: InterfaceData) => {
              return {
                columns: [
                  {
                    content: (
                      <Link to={`/interfaces/${item?.name}`}>{item?.name}</Link>
                    ),
                  },
                  {
                    content: item?.description.split(".")[0],
                  },
                  {
                    content: "",
                  },
                  { content: "" },
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
