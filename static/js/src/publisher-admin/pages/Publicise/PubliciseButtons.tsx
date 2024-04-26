import { useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "@canonical/react-components";

import { languages } from "../../utils";

function PubliciseButtons() {
  const { packageName } = useParams();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  return (
    <>
      <h2 className="p-heading--4">
        Promote your charm using Charmhub buttons
      </h2>
      <Row>
        <Col size={2}>
          <label htmlFor="language">Language:</label>
        </Col>
        <Col size={7}>
          <div className="p-form--inline">
            <select
              defaultValue={selectedLanguage}
              name="language"
              id="language"
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
              }}
            >
              {Object.keys(languages).map((language) => (
                <option value={language} key={language}>
                  {languages[language].title}
                </option>
              ))}
            </select>
          </div>
        </Col>
      </Row>

      <hr className="p-separator--shallower"></hr>

      <h3 className="p-heading--4">Dark version</h3>

      <Row>
        <Col size={7} className="col-start-large-3">
          <p>
            <a href={`/${packageName}`}>
              <img
                alt=""
                src={`/static/images/badges/${selectedLanguage}/charmhub-black.svg`}
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
  <img alt="" src="https://charmhub.io/static/images/badges/${selectedLanguage}/charmhub-black.svg" />
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
            <pre className="p-code-snippet__block is-wrapped"><code>{`[![${languages[selectedLanguage].text}](https://charmhub.io/static/images/badges/${selectedLanguage}/charmhub-black.svg)](https://charmhub.io/${packageName})`}</code></pre>
          </div>
        </Col>
      </Row>

      <hr className="p-separator--shallower"></hr>

      <h3 className="p-heading--4">Light version</h3>

      <Row>
        <Col size={7} className="col-start-large-3">
          <p>
            <a href={`/${packageName}`}>
              <img
                alt=""
                src={`/static/images/badges/${selectedLanguage}/charmhub-white.svg`}
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
  <img alt="" src="https://charmhub.io/static/images/badges/${selectedLanguage}/charmhub-white.svg" />
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
            <pre className="p-code-snippet__block is-wrapped"><code>{`[![${languages[selectedLanguage].text}](https://charmhub.io/static/images/badges/${selectedLanguage}/charmhub-white.svg)](https://charmhub.io/${packageName})`}</code></pre>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default PubliciseButtons;
