import { NavLink, useParams, useLocation } from "react-router-dom";
import { Row, Col } from "@canonical/react-components";

import PubliciseBadges from "./PubliciseBadges";
import PubliciseButtons from "./PubliciseButtons";
import PubliciseCards from "./PubliciseCards";

function Publicise() {
  const { packageName } = useParams();
  const location = useLocation();
  const showButtons = location.pathname === `/${packageName}/publicise`;
  const showBadges = location.pathname === `/${packageName}/publicise/badges`;
  const showCards = location.pathname === `/${packageName}/publicise/cards`;

  return (
    <Row>
      <Col size={3}>
        <div className="p-side-navigation " id="drawer">
          <a
            href="#drawer"
            className="p-side-navigation__toggle"
            aria-controls="drawer"
          >
            Toggle side navigation
          </a>
          <div
            className="p-side-navigation__overlay"
            aria-controls="drawer"
          ></div>
          <nav className="p-side-navigation__drawer">
            <div className="p-side-navigation__drawer-header" id="drawer">
              <a
                href="#drawer"
                className="p-side-navigation__toggle--in-drawer"
                aria-controls="drawer"
              >
                Toggle side navigation
              </a>
            </div>
            <ul className="p-side-navigation__list">
              <li className="p-side-navigation__item">
                <NavLink
                  end
                  to={`/${packageName}/publicise`}
                  className="p-side-navigation__link"
                >
                  Charmhub buttons
                </NavLink>
              </li>
              <li className="p-side-navigation__item">
                <NavLink
                  end
                  to={`/${packageName}/publicise/badges`}
                  className="p-side-navigation__link"
                >
                  GitHub badges
                </NavLink>
              </li>
              <li className="p-side-navigation__item">
                <NavLink
                  end
                  to={`/${packageName}/publicise/cards`}
                  className="p-side-navigation__link"
                >
                  Embeddable cards
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </Col>
      <Col size={9}>
        {showButtons && <PubliciseButtons />}
        {showBadges && <PubliciseBadges />}
        {showCards && <PubliciseCards />}
      </Col>
    </Row>
  );
}

export default Publicise;
