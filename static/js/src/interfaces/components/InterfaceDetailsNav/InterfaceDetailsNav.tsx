import React from "react";

type Props = {
  hasDeveloperDocumentation: Function;
};

function InterfaceDetailsNav({ hasDeveloperDocumentation }: Props) {
  return (
    <div className="p-side-navigation u-hide--small u-hide--medium">
      <ul className="p-side-navigation__list">
        <li className="p-side-navigation__item">
          <a href="#charms" className="p-side-navigation__link is-active">
            Charms
          </a>
        </li>
        {hasDeveloperDocumentation() && (
          <li className="p-side-navigation__item">
            <a
              href="#developer-documentation"
              className="p-side-navigation__link"
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
