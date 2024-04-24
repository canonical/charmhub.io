import { useParams, useLocation, NavLink } from "react-router-dom";

function SectionNav() {
  const { packageName } = useParams();
  const location = useLocation();

  const getSectionName = (path: string, sectionName: string) => {
    const pathFragments = path.split("/");
    return pathFragments[pathFragments.length - 1] === sectionName;
  };

  return (
    <nav className="p-tabs">
      <ul className="p-tabs__list u-no-margin--bottom" role="tablist">
        <li className="p-tabs__item" role="presentation">
          <a href={`/${packageName}/listing`} className="p-tabs__link">
            Listing
          </a>
        </li>
        <li className="p-tabs__item" role="presentation">
          <a href={`/${packageName}/publicise`} className="p-tabs__link">
            Publicise
          </a>
        </li>
        <li className="p-tabs__item" role="presentation">
          <a href={`/${packageName}/collaboration`} className="p-tabs__link">
            Collaboration
          </a>
        </li>
        <li className="p-tabs__item" role="presentation">
          <NavLink
            to={`/${packageName}/settings`}
            className="p-tabs__link"
            aria-selected={getSectionName(location.pathname, "settings")}
          >
            Settings
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default SectionNav;
