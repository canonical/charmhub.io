import { useQuery } from "react-query";
import { Package } from "../types";

function usePackage(packageName: string | undefined) {
  return useQuery(["packageData", packageName], async () => {
    const response = await fetch(`/api/packages/${packageName}`);

    if (!response.ok) {
      throw new Error("There was a problem fetching the package data");
    }

    const packageData = await response.json();

    if (!packageData.success) {
      throw new Error(packageData?.message);
    }

    return packageData.data as Package;
  });
}

export default usePackage;
