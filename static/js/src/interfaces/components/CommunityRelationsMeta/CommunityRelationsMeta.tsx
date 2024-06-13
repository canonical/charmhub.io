import { Button } from "@canonical/react-components";

function CommunityRelationsMeta() {
  return (
    <>
      <h2 className="p-muted-heading">Help us test this interface</h2>
      <p>
        This interface doesn't have a schema yet, help the community and get
        involved.
      </p>
      <p>
        <Button
          element="a"
          href={`https://github.com/canonical/charm-relation-interfaces`}
          appearance="positive"
        >
          Contribute
        </Button>
      </p>
    </>
  );
}

export default CommunityRelationsMeta;
