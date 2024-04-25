import { useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "@canonical/react-components";

function PubliciseCards() {
  const { packageName } = useParams();
  const [buttonStyle, setButtonStyle] = useState<string>("black");
  const [showChannels, setShowChannels] = useState<boolean>(true);
  const [showSummary, setShowSummary] = useState<boolean>(true);
  const [showBase, setShowBase] = useState<boolean>(true);

  const urlParameters: {
    button?: string;
    channels?: string;
    summary?: string;
    base?: string;
  } = {};

  if (buttonStyle === "black" || buttonStyle === "white") {
    urlParameters.button = buttonStyle;
  }

  if (showChannels) {
    urlParameters.channels = "true";
  }

  if (showSummary) {
    urlParameters.summary = "true";
  }

  if (showBase) {
    urlParameters.base = "true";
  }

  const urlQuery = new URLSearchParams(urlParameters);

  return (
    <>
      <h2 className="p-heading--4">
        Promote your charm using embeddable responsive card
      </h2>
      <Row>
        <Col size={2}>
          <p className="u-no-margin--bottom">Charmhub button style:</p>
        </Col>
        <Col size={7}>
          <input
            type="radio"
            name="charmhub-button"
            id="charmhub-button-dark"
            value="black"
            checked={buttonStyle === "black"}
            onChange={() => {
              setButtonStyle("black");
            }}
          />{" "}
          <label htmlFor="charmhub-button-dark">Dark</label>{" "}
          <input
            type="radio"
            name="charmhub-button"
            id="charmhub-button-light"
            value="white"
            checked={buttonStyle === "white"}
            onChange={() => {
              setButtonStyle("white");
            }}
          />{" "}
          <label htmlFor="charmhub-button-light">Light</label>{" "}
          <input
            type="radio"
            name="charmhub-button"
            id="charmhub-button-hide"
            value=""
            checked={buttonStyle === "hidden"}
            onChange={() => {
              setButtonStyle("hidden");
            }}
          />{" "}
          <label htmlFor="charmhub-button-hide">Hide button</label>
        </Col>
      </Row>
      <Row>
        <Col size={2}>Options:</Col>
        <Col size={7}>
          <input
            type="checkbox"
            name="show-channels"
            id="option-show-channels"
            checked={showChannels}
            onChange={(e) => {
              setShowChannels(e.target.checked);
            }}
          />{" "}
          <label htmlFor="option-show-channels">All channels</label>{" "}
          <input
            type="checkbox"
            name="show-summary"
            id="option-show-summary"
            checked={showSummary}
            onChange={(e) => {
              setShowSummary(e.target.checked);
            }}
          />{" "}
          <label htmlFor="option-show-summary">Show summary</label>{" "}
          <input
            type="checkbox"
            name="show-base"
            id="option-show-base"
            checked={showBase}
            onChange={(e) => {
              setShowBase(e.target.checked);
            }}
          />{" "}
          <label htmlFor="option-show-base">Show runs on</label>
        </Col>
      </Row>
      <Row>
        <Col size={2}>
          <p>HTML:</p>
        </Col>
        <Col size={7}>
          <div className="p-code-snippet">
            {/* prettier-ignore */}
            <pre className="p-code-snippet__block is-wrapped"><code data-js="snippet-card-html">&lt;iframe src="https://charmhub.io/{packageName}/embedded?{urlQuery.toString()}" frameborder="0" width="100%" height="500px" style="border: 1px solid #CCC; border-radius: 2px;"&gt;&lt;/iframe&gt;</code></pre>
          </div>
        </Col>
      </Row>
      <Row>
        <Col size={2}>
          <p>Preview:</p>
        </Col>
        <Col size={7}>
          <iframe
            title={`${packageName} embeddable card`}
            src={`/${packageName}/embedded?${urlQuery.toString()}`}
            width="100%"
            height="500px"
            style={{ border: "1px solid #ccc", borderRadius: "2px" }}
          ></iframe>
        </Col>
      </Row>
    </>
  );
}

export default PubliciseCards;
