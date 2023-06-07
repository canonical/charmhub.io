import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { Strip, Row, Col, Pagination } from "@canonical/react-components";
import { CharmCard } from "@canonical/store-components";

function Packages() {
  const getData = async () => {
    const response = await fetch(`/store.json?page=${currentPage}`);
    const data = await response.json();
    const packagesWithId = data.packages.map((item: any) => {
      return {
        ...item,
        id: crypto.randomUUID(),
      };
    });

    return {
      total_pages: data.total_pages,
      packages: packagesWithId,
    };
  };

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const [currentPage, setCurrentPage] = useState(
    queryParams.get("page") || "1"
  );
  const { data, status, refetch } = useQuery("data", getData);

  useEffect(() => {
    refetch();
  }, [currentPage]);

  return (
    <Strip>
      <Row>
        <Col size={3}>
          <h2 className="p-heading--4">Filters</h2>
        </Col>
        <Col size={9}>
          <Row>
            {status === "loading" && <p>Loading packages...</p>}

            {status === "success" &&
              data.packages.length > 0 &&
              data.packages.map((packageData: any) => (
                <Col
                  size={3}
                  style={{ marginBottom: "1.5rem" }}
                  key={packageData.id}
                >
                  <CharmCard data={packageData} />
                </Col>
              ))}
          </Row>
          <Pagination
            itemsPerPage={12}
            totalItems={data?.total_pages}
            paginate={(pageNumber) => {
              setCurrentPage(pageNumber.toString());
              queryParams.set("page", pageNumber.toString());
              window.location.search = queryParams.toString();
            }}
            currentPage={parseInt(currentPage)}
            centered
            scrollToTop
          />
        </Col>
      </Row>
    </Strip>
  );
}

export default Packages;
