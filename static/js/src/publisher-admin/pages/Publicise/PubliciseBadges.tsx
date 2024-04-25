import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { Row, Col } from "@canonical/react-components";

import { packageDataState } from "../../state/atoms";

function PubliciseBadges() {
  const { packageName } = useParams();
  const packageData = useRecoilValue(packageDataState);

  return (
    <>
      <h2 className="p-heading--4">
        Promote your charm using an embeddable GitHub badge
      </h2>
      <Row>
        <Col size={7} className="col-start-large-3">
          <p>
            <a href={`/${packageName}`}>
              <img
                src={`/${packageName}/badge.svg`}
                alt={`${packageName} GitHub badge`}
              />
            </a>
          </p>
        </Col>
      </Row>
      <Row>
        <Col size={2}>
          <p>HTML:</p>
        </Col>
        <Col size={7}>
          <div className="p-code-snippet">
            {/* prettier-ignore */}
            <pre className="p-code-snippet__block is-wrapped"><code>{`<a href="https://charmhub.io/${packageName}">
    <img alt="" src="https://charmhub.io/${packageName}/badge.svg" />
</a>`}</code></pre>
          </div>
        </Col>
      </Row>
      <Row>
        <Col size={2}>
          <p>Markdown:</p>
        </Col>
        <Col size={7}>
          <div className="p-code-snippet">
            {/* prettier-ignore */}
            <pre className="p-code-snippet__block is-wrapped"><code>{`[![${packageData?.title}](https://charmhub.io/${packageName}/badge.svg)](https://charmhub.io/${packageName})`}</code></pre>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default PubliciseBadges;
