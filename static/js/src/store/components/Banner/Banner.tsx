import { RefObject } from "react";
import { Strip, Row, Col } from "@canonical/react-components";
import { SearchInput } from "../SearchInput";

type Props = {
  searchRef: RefObject<HTMLInputElement>;
  searchSummaryRef: RefObject<HTMLDivElement>;
};

function Banner({ searchRef, searchSummaryRef }: Props) {
  return (
    <Strip type="dark">
      <Row>
        <Col size={6} className="col-start-large-4">
          <h1 className="p-heading--2">The Charm Collection</h1>
          <SearchInput
            searchRef={searchRef}
            searchSummaryRef={searchSummaryRef}
          />
        </Col>
      </Row>
    </Strip>
  );
}

export default Banner;
