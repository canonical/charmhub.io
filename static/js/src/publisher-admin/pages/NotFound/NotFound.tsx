import { Row, Col } from "@canonical/react-components";

function NotFound() {
  return (
    <section className="p-strip is-deep">
      <Row>
        <Col size={4} className="u-align--center">
          <img
            src="https://assets.ubuntu.com/v1/4de1c56c-404_v1.svg"
            width="346"
            height="346"
            className="p-image--smaller-mobile"
            alt="Error 404 - Page not found"
          />
        </Col>
        <Col size={7} className="col-start-large-6">
          <h1 className="p-heading--2">404: We couldn't find that page</h1>
          <p>
            <strong>The page you requested isn't currently available.</strong>
            <br />
            Here are some things that may have caused this:
          </p>
          <ul>
            <li>
              The page that sent you here may have the wrong link.
              <br />
              You can let us know about this{" "}
              <a href="https://github.com/canonical-web-and-design/charmhub.io/issues/new">
                here
              </a>
            </li>
            <li>The URL may be wrong. We recommend you check it for typos</li>
            <li>
              We made a mistake and this page has stopped working momentarily
            </li>
          </ul>
          <p>You may want to do a new search:</p>
          <form action="/" className="p-form p-form--inline">
            <div className="p-form__group">
              <div className="p-form__control u-clearfix">
                <label htmlFor="search-input" className="u-off-screen">
                  Search
                </label>
                <input
                  type="search"
                  name="q"
                  id="search-input"
                  placeholder="Search"
                  required
                />
              </div>
            </div>
            <button type="submit" className="p-button--positive">
              Search
            </button>
          </form>
          <p>
            Or return to the <a href="/">homepage</a>.
          </p>
        </Col>
      </Row>
    </section>
  );
}

export default NotFound;
