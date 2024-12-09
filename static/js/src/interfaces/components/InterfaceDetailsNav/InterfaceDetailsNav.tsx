import { useState } from "react";

type Props = {
  hasDeveloperDocumentation: boolean;
};

function InterfaceDetailsNav({ hasDeveloperDocumentation }: Props) {
  const [activeLink, setActiveLink] = useState("charms");
  return (
    <div className="p-side-navigation">
      <ul className="p-side-navigation__list">
        <li className="p-side-navigation__item">
          <a
            href="#charms"
            className={`p-side-navigation__link ${
              activeLink === "charms" ? "is-active" : ""
            }`}
            onClick={() => setActiveLink("charms")}
          >
            Charms
          </a>
        </li>
        {hasDeveloperDocumentation && (
          <li className="p-side-navigation__item">
            <a
              href="#developer-documentation"
              className={`p-side-navigation__link ${
                activeLink === "developer-documentation" ? "is-active" : ""
              }`}
              onClick={() => setActiveLink("developer-documentation")}
            >
              Developer documentation
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

export default InterfaceDetailsNav;
