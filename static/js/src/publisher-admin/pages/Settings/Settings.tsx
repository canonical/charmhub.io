import { useRecoilValue } from "recoil";
import { Row, Col } from "@canonical/react-components";

import { packageDataState } from "../../state/atoms";
import { capitalize } from "../../utils";

import type { Package } from "../../types";

function Settings() {
  const packageData = useRecoilValue<Package | undefined>(packageDataState);

  return (
    <section className="p-strip u-no-padding--top">
      <Row>
        <Col size={2}>
          <p>Status:</p>
        </Col>
        <Col size={8}>
          <p>{packageData && capitalize(packageData?.status)}</p>
        </Col>
      </Row>
    </section>
  );
}

export default Settings;
