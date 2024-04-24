import { useQuery } from "react-query";

function usePackage(packageName: string | undefined) {
  return useQuery("packageData", async () => {
    const response = await fetch(`/api/packages/${packageName}`);

    if (!response.ok) {
      throw new Error("There was a problem fetching the package data");
    }

    const packageData = await response.json();

    if (!packageData.success) {
      throw new Error(packageData?.message);
    }

    return packageData.data;
  });
}

export default usePackage;
