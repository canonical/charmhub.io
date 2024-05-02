import { useParams, useLocation, NavLink } from "react-router-dom";

function SectionNav() {
  const { packageName } = useParams();
  const location = useLocation();

  const isSelected = (sectionPath: string) => {
    return location.pathname === sectionPath;
  };

  return (
    <nav className="p-tabs">
      <ul className="p-tabs__list" role="tablist">
        <li className="p-tabs__item" role="presentation">
          <NavLink
            to={`/${packageName}/listing`}
            className="p-tabs__link"
            aria-selected={isSelected(`/${packageName}/listing`)}
          >
            Listing
          </NavLink>
        </li>
        <li className="p-tabs__item" role="presentation">
          <NavLink
            to={`/${packageName}/publicise`}
            className="p-tabs__link"
            aria-selected={
              isSelected(`/${packageName}/publicise`) ||
              isSelected(`/${packageName}/publicise/badges`) ||
              isSelected(`/${packageName}/publicise/cards`)
            }
          >
            Publicise
          </NavLink>
        </li>
        <li className="p-tabs__item" role="presentation">
          <NavLink
            to={`/${packageName}/collaboration`}
            className="p-tabs__link"
            aria-selected={isSelected(`/${packageName}/collaboration`)}
          >
            Collaboration
          </NavLink>
        </li>
        <li className="p-tabs__item" role="presentation">
          <NavLink
            to={`/${packageName}/settings`}
            className="p-tabs__link"
            aria-selected={isSelected(`/${packageName}/settings`)}
          >
            Settings
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default SectionNav;
