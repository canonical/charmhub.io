import { useParams } from "react-router-dom";
import ReleasesTable from "./ReleasesTable";
import useReleases from "../../hooks/useReleases";
import { useEffect, useState } from "react";
import {
  Form,
  Select,
  Spinner,
  AppAside,
  Notification,
  EmptyState,
  Button,
} from "@canonical/react-components";
import { usePackage } from "../../hooks";
import { TrackInfo } from "./TrackInfo";
import { TrackDropdown } from "./TrackDropdown";
import RequestTrackPanel from "./RequestTrackPanel";
import AddTrackPanel from "./AddTrackPanel";

enum SidePanelType {
  RequestTrack = "RequestTrack",
  AddTrack = "AddTrack",
}

export default function Releases() {
  const { packageName } = useParams();
  const { data: releaseData } = useReleases(packageName);
  const { data: packageData } = usePackage(packageName);

  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedArch, setSelectedArch] = useState<string>("");
  const [showSidePanel, setShowSidePanel] = useState<boolean | SidePanelType>(
    false
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (releaseData && packageData) {
      setSelectedArch(releaseData.all_architectures[0]);

      if (!selectedTrack) {
        const tracks = Object.values(releaseData.releases).map(
          (release) => release.track
        );

        setSelectedTrack(
          packageData["default-track"] || tracks.includes("latest")
            ? "latest"
            : tracks[0]
        );
      }
    }
  }, [releaseData, packageData, selectedTrack]);

  const channels = Object.values(releaseData?.releases || {}).filter(
    (channel) => channel.track === selectedTrack
  );

  const availableArchitectures = [
    ...new Set(
      channels.flatMap((channel) =>
        channel.releases.flatMap((release) =>
          release.revision.bases.map((base) => base.architecture)
        )
      )
    ),
  ];

  useEffect(() => {
    if (!availableArchitectures.includes(selectedArch)) {
      setSelectedArch(availableArchitectures[0]);
    }
  }, [selectedTrack, availableArchitectures, selectedArch]);

  if (!releaseData) {
    return <Spinner text="Loading..." />;
  }

  if (Object.keys(releaseData.releases).length === 0) {
    return <EmptyState
      title="No releases have been added for this charm yet"
      image={<img src="https://assets.ubuntu.com/v1/3234f995-Generic_chamhub_NoDocs.svg" alt="" />}>
      <p>Charm or bundle revisions are not published for anybody else until yuo release them in a channel.</p>
      <Button appearance="positive" onClick={() =>
        window.open('https://juju.is/docs/sdk/publishing#heading--release-the-charm', '_blank')
      } >
        Learn how to release a charm
      </Button>
    </EmptyState>
  }

  const { all_architectures } = releaseData;

  const tracks = packageData?.tracks.map((track) => track.name) || [];

  availableArchitectures.sort(
    (a, b) => all_architectures.indexOf(a) - all_architectures.indexOf(b)
  );
  const trackData = packageData?.tracks.find(
    (track) => track.name === selectedTrack
  );

  const versionPattern = trackData?.["version-pattern"] || null;
  const automaticPhasingPercentage =
    trackData?.["automatic-phasing-percentage"] || null;

  const guardRails = packageData?.["track-guardrails"];

  return (
    <>
      <h2 className="p-heading--4">Releases available to install</h2>
      <Form inline>
        <TrackDropdown
          defaultTrack={packageData?.["default-track"]}
          tracks={tracks}
          selectedTrack={selectedTrack}
          setSelectedTrack={(track) => {
            setShowSuccessMessage(false);
            setSelectedTrack(track);
          }}
          hasGuardrails={guardRails && guardRails.length > 0}
          onRequestTrack={() => {
            setShowSidePanel(SidePanelType.RequestTrack);
          }}
          onAddTrack={() => {
            setShowSidePanel(SidePanelType.AddTrack);
          }}
        />
        <Select
          label="Architecture:"
          name="arch"
          disabled={availableArchitectures.length <= 1}
          value={selectedArch}
          onChange={(e) => {
            setSelectedArch(e.target.value);
          }}
          options={availableArchitectures.map((arch) => ({
            label: arch,
            value: arch,
          }))}
        />
      </Form>
      {showSuccessMessage && (
        <Notification severity="positive">
          Track {selectedTrack} added successfully
        </Notification>
      )}
      <TrackInfo
        versionPattern={versionPattern}
        automaticPhasingPercentage={automaticPhasingPercentage}
      />
      {
        channels.length === 0 ?
          <Notification severity="information">No Releases have been added for this track yet</Notification>
          :
          (
            <ReleasesTable releaseMap={channels} arch={selectedArch} />
          )
      }
      {showSidePanel && (
        <div
          className="l-aside__overlay"
          onClick={() => setShowSidePanel(false)}
        />
      )}
      <AppAside className={`${!showSidePanel && "is-collapsed"}`}>
        {showSidePanel === SidePanelType.RequestTrack && (
          <RequestTrackPanel
            charmName={packageName || ""}
            onClose={() => setShowSidePanel(false)}
          />
        )}
        {showSidePanel === SidePanelType.AddTrack && (
          <AddTrackPanel
            charmName={packageName || ""}
            onClose={() => setShowSidePanel(false)}
            setSelectedTrack={setSelectedTrack}
            onSuccess={() => {
              setShowSuccessMessage(true);
            }}
          />
        )}
      </AppAside>
    </>
  );
}
