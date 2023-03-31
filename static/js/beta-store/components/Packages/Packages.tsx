import React from "react";
import { useQuery } from "react-query";
import { Strip, Row, Col } from "@canonical/react-components";
import { CharmCard } from "@canonical/store-components";

function Packages() {
  const getPackages = async () => {
    const response = await fetch("/beta/store");
    const packages = await response.json();
    const packagesWithId = packages.packages.map((item: any) => {
      return {
        ...item,
        id: crypto.randomUUID(),
      };
    });

    return packagesWithId;
  };

  const { data, status } = useQuery("packages", getPackages);

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
              data.length > 0 &&
              data.map((packageData: any) => (
                <Col size={3} style={{ marginBottom: "1.5rem" }}>
                  <CharmCard key={packageData.id} data={packageData} />
                </Col>
              ))}
          </Row>
        </Col>
      </Row>
    </Strip>
  );
}

export default Packages;
