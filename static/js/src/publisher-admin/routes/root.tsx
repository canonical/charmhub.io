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

  // This is to be removed
  window.testSentryError = () => {
    throw new Error("Testing sentry on charmhub.io");
  };

  return (
    <>
      <SectionHeader />
      <div className="l-application">
        <div className="l-main">
          <div className="p-panel">
            <div className="p-panel__content">
              <div className="u-fixed-width">
                <SectionNav />
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Root;
