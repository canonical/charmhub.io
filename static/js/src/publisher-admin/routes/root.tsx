import { Outlet } from "react-router-dom";

import { SectionHeader, SectionNav } from "../components";

function Root() {
  return (
    <>
      <SectionHeader />
      <section className="p-strip is-shallow u-no-padding--bottom">
        <div className="u-fixed-width">
          <SectionNav />
        </div>
      </section>
      <section className="p-strip is-shallow">
        <div className="u-fixed-width">
          <Outlet />
        </div>
      </section>
    </>
  );
}

export default Root;
