import React, { useState } from "react";
import { useQuery } from "react-query";
import { Strip, Row, Col } from "@canonical/react-components";
import { CardList, Filters } from "@canonical/store-components";

const getPackages = async () => {
  const response = await fetch("/packages.json");
  const packages = await response.json();
  return packages;
};

// This won't be necessary once we are fetching data
// from the beta store API
const formatData = (data: any) => {
  if (!data) {
    return {
      packages: [],
    };
  }

  return data.packages.map((d: any) => {
    return {
      id: d.id,
      package: {
        description: d.result.summary,
        display_name: d.store_front["display-name"],
        icon_url: d.store_front.icons[0],
        name: d.name,
        platforms: d.store_front["deployable-on"],
        type: d.type,
      },
      publisher: {
        display_name: d.result.publisher["display-name"],
        name: d.result.publisher["display-name"],
        validation: null,
      },
      categories: d.store_front["categories"] || [],
    };
  });
};

function Packages() {
  const { data } = useQuery("packages", getPackages);
  const formattedData = formatData(data);

  const [packages, setPackages] = useState(formattedData);

  return (
    <Strip>
      <Row>
        <Col size={3}>
          {formattedData && formattedData.length > 0 && (
            <Filters
              setFilteredPackages={setPackages}
              packages={formattedData}
              categories={[
                {
                  display_name: "AI/ML",
                  name: "ai-ml",
                },
                {
                  display_name: "Big Data",
                  name: "bigdata",
                },
                {
                  display_name: "Cloud",
                  name: "cloud",
                },
                {
                  display_name: "Containers",
                  name: "containers",
                },
                {
                  display_name: "Databases",
                  name: "databases",
                },
                {
                  display_name: "Logging and Tracing",
                  name: "logging-and-tracing",
                },
                {
                  display_name: "Monitoring",
                  name: "monitoring",
                },
                {
                  display_name: "Networking",
                  name: "networking",
                },
                {
                  display_name: "Security",
                  name: "security",
                },
                {
                  display_name: "Storage",
                  name: "storage",
                },
              ]}
              types={[
                { label: "All", value: "all" },
                { label: "Charms", value: "charm" },
                { label: "Bundles", value: "bundle" },
              ]}
              platforms={[
                { label: "All", value: "all" },
                { label: "VM", value: "vm" },
                { label: "Kubernetes", value: "kubernetes" },
              ]}
            />
          )}
        </Col>
        <Col size={9}>
          {formattedData.length > 0 ? (
            <CardList packages={formattedData} itemsPerPage={12} />
          ) : (
            <Row>
              <h2>Loading packages...</h2>
            </Row>
          )}
        </Col>
      </Row>
    </Strip>
  );
}

export default Packages;
