import { RefObject } from "react";
import { Strip, Row, Col } from "@canonical/react-components";
import { SearchInput } from "../SearchInput";

type Props = {
  searchRef: RefObject<HTMLInputElement>;
};

function Banner({ searchRef }: Props) {
  return (
    <Strip type="dark">
      <Row>
        <Col size={6} className="col-start-large-4">
          <h1 className="p-heading--2">The Charm Collection</h1>
          <SearchInput searchRef={searchRef} />
        </Col>
      </Row>
    </Strip>
  );
}

export default Banner;
