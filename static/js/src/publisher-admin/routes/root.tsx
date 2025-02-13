import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";

import { SectionHeader, SectionNav } from "../components";

import { usePackage } from "../hooks";
import { packageDataState } from "../state/atoms";

function Root() {
  const { packageName } = useParams();
  const setPackageData = useSetRecoilState(packageDataState);
  const { data: packageData, status: packageDataStatus } =
    usePackage(packageName);

  useEffect(() => {
    if (packageDataStatus === "success") {
      setPackageData(packageData);
    }
  }, [packageData]);

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
