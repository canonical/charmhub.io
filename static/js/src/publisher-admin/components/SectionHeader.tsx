import { useParams } from "react-router-dom";

function SectionHeader() {
  const { packageName } = useParams();

  return (
    <section className="p-strip--grey is-shallow">
      <div className="u-fixed-width">
        <a href="/charms">&lsaquo;&nbsp;My charms &amp; bundles</a>
        <h1 className="p-heading--3">
          {packageName} <small>by</small>
        </h1>
      </div>
    </section>
  );
}

export default SectionHeader;
