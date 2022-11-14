import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
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

function App() {
  const ITEMS_PER_PAGE = 10;

  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);

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
              Lorem ipsum vitae. This will be intro text about what are
              interfaces. Similiar to what we have for topic pages.
            </p>
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
                    content: item?.name,
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
              setCurrentPageIndex(pageNumber - 1);
            }}
            totalItems={interfaces.length}
          />
        </div>
      </Strip>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("main-content"));
