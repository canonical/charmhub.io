import React from "react";
import { TypeAnimation } from "react-type-animation";
import { Strip, Row, Col } from "@canonical/react-components";

function Banner() {
  const terms = [
    "Kubernetes",
    "Bare metal",
    "VM workloads",
    "infrastructure",
    "integrations",
    "deployment",
    "management",
    "hybrid cloud",
    "multi cloud",
    "observability",
    "identity",
    "data",
    "applications",
  ];

  const sequence: Array<string | number> = [];

  terms.forEach((term) => {
    sequence.push(term);
    sequence.push(1500);
  });

  return (
    <Strip type="dark">
      <Row>
        <Col size={6}>
          <h1>
            Take control of <br />
            <TypeAnimation
              sequence={sequence}
              wrapper="span"
              speed={30}
              repeat={Infinity}
              style={{ display: "block", height: "1.2em" }}
              cursor={false}
              deletionSpeed={60}
            />
          </h1>
          <h2 className="p-heading--4">The Charm Collection</h2>
        </Col>
        <Col size={6}>
          <p>
            Take control of your applications and infrastructure across hybrid
            cloud, Kubernetes (K8s) and VM environments. Deploy, integrate and
            manage your way beyond configuration management to application
            management. Charms use{" "}
            <a className="p-link--inverted" href="https://juju.is">
              Juju
            </a>
            . They’re broad, they’re powerful and they're Open Source (unless
            you choose otherwise).
          </p>
        </Col>
      </Row>
    </Strip>
  );
}

export default Banner;
