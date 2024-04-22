import { useParams } from "react-router-dom";

function SectionNav() {
  const { packageName } = useParams();

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
          <a href={`/${packageName}/settings`} className="p-tabs__link">
            Settings
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default SectionNav;
