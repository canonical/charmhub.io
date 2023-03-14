import React from "react";
import { useQuery } from "react-query";
import { Strip, Row } from "@canonical/react-components";
import { CardList } from "@canonical/store-components";

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
      categories: d.store_front["categories"],
    };
  });
};

function Packages() {
  const { data } = useQuery("packages", getPackages);
  const formattedData = formatData(data);

  return (
    <Strip>
      {formattedData.length > 0 ? (
        <CardList packages={formattedData} itemsPerPage={12} />
      ) : (
        <Row>
          <h2>Loading packages...</h2>
        </Row>
      )}
    </Strip>
  );
}

export default Packages;
