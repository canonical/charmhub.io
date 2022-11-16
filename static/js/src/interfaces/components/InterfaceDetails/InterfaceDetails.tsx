import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  Strip,
  Row,
  Col,
  Notification,
  Button,
  Icon,
} from "@canonical/react-components";

function InterfaceDetails() {
  const { interfaceName } = useParams();

  return (
    <>
      <Strip type="light" shallow>
        <h1>{interfaceName}</h1>
        <p>
          <Link to="/interfaces">See all interfaces</Link>
        </p>
      </Strip>
      <Strip>
        <Row>
          <Col size={3}>
            <h2 className="p-muted-heading">Relevant links</h2>
            <p>
              <a href="https://github.com/canonical/charmhub.io">
                <Icon name="submit-bug" />
                &nbsp;&nbsp;Submit a bug
              </a>
            </p>
            <h2 className="p-muted-heading">Help us improve this page</h2>
            <p>
              Most of the content of these pages can be collaboratively
              discussed and changed. Help us improve these pages by clicking the
              button below.
            </p>
            <p>
              <Button
                element="a"
                href="https://github.com/canonical/charm-relation-interfaces"
                appearance="positive"
              >
                Contribute
              </Button>
            </p>
            <h2 className="p-muted-heading">Discuss this interface</h2>
            <p>
              Share your thoughts on this interface with the community on
              discourse.
            </p>
            <p>
              <Button element="a" href="https://discourse.charmhub.io/">
                Join the discussion
              </Button>
            </p>
          </Col>
          <Col size={9}>
            <h2>Charms</h2>
            <hr />
            <h3 className="p-heading--4">Providing {interfaceName}</h3>
            <h4 className="p-muted-heading">Tested charms</h4>
            <h4 className="p-muted-heading">Other charms</h4>
            <hr />
            <h3 className="p-heading--4">Requiring {interfaceName}</h3>
            <h4 className="p-muted-heading">Tested charms</h4>
            <h4 className="p-muted-heading">Other charms</h4>
            <p>
              <a href="https://discourse.charmhub.io/t/getting-started-with-charm-testing/6894">
                How to test a charm
              </a>
            </p>
            <Notification severity="information">
              Last updated 2 months ago.{" "}
              <a href="https://github.com/canonical/charm-relation-interfaces">
                Help improve this page
              </a>
              .
            </Notification>
          </Col>
        </Row>
      </Strip>
    </>
  );
}

export default InterfaceDetails;
