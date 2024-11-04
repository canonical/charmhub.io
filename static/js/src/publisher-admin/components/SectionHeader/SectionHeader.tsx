import { useRecoilValue } from "recoil";
import { packageDataState } from "../../state/atoms";

import type { Package } from "../../types";

function SectionHeader() {
  const packageData = useRecoilValue<Package | undefined>(packageDataState);

  return (
    <section className="p-strip--grey is-shallow">
      <div className="u-fixed-width">
        <a href="/charms">&lsaquo;&nbsp;My charms &amp; bundles</a>
        {packageData && (
          <h1 className="p-heading--3">
            {packageData?.name}{" "}
            <small>by {packageData?.publisher?.["display-name"]}</small>
          </h1>
        )}
      </div>
    </section>
  );
}

export default SectionHeader;
