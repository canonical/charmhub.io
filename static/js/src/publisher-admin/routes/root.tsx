import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { Outlet, useParams } from "react-router-dom";

import { SectionHeader, SectionNav } from "../components";

import { usePackage } from "../hooks";
import { packageDataState } from "../state/atoms";

function Root() {
  const { packageName } = useParams();
  const setPackageData = useSetAtom(packageDataState);
  const { data: packageData, status: packageDataStatus } =
    usePackage(packageName);

  useEffect(() => {
    if (packageDataStatus === "success") {
      setPackageData(packageData);
    }
  }, [packageData, packageDataStatus, setPackageData]);

  return (
    <>
      <SectionHeader />
      <div className="u-fixed-width">
        <SectionNav />
        <Outlet />
      </div>
    </>
  );
}

export default Root;
