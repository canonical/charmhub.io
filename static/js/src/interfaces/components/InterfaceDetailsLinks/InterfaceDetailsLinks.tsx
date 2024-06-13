import { Icon } from "@canonical/react-components";

type Props = {
  isCommunity: boolean;
  interfaceName: string | undefined;
  interfaceVersion: string | undefined;
};

function InterfaceDetailsLinks({
  isCommunity,
  interfaceName,
  interfaceVersion,
}: Props) {
  return (
    <>
      <h2 className="p-muted-heading">Relevant links</h2>
      <p>
        <a
          href={`https://github.com/canonical/charm-relation-interfaces/issues/new?title=${
            isCommunity ? "(Untested)+" : ""
          }${interfaceName}${interfaceVersion ? `+${interfaceVersion}` : ""}`}
        >
          <Icon name="submit-bug" />
          &nbsp;&nbsp;Submit a bug
        </a>
      </p>
      {!isCommunity && (
        <p>
          <a
            href={`https://github.com/canonical/charm-relation-interfaces/tree/main/interfaces/${interfaceName}`}
          >
            <i className="p-icon--archive"></i>
            &nbsp;&nbsp;Specification archive
          </a>
        </p>
      )}
    </>
  );
}

export default InterfaceDetailsLinks;
