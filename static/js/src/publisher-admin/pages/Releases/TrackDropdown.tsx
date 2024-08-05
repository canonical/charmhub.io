import { Button } from "@canonical/react-components";
import { Dispatch, SetStateAction, useState } from "react";

type TrackDropdownProps = {
  defaultTrack?: string;
  tracks: string[];
  selectedTrack: string;
  setSelectedTrack: Dispatch<React.SetStateAction<string>>;
  hasGuardrails?: boolean;
  onAddTrack?: () => void;
  onRequestTrack?: () => void;
};

export function TrackDropdown({
  defaultTrack,
  tracks,
  selectedTrack,
  setSelectedTrack,
  hasGuardrails,
  onAddTrack,
  onRequestTrack,
}: TrackDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <label htmlFor="track-dropdown">Track: </label>

      <div className="track-dropdown" role="listbox">
        <div
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
          role="listbox"
          aria-haspopup="true"
          id="track-dropdown"
          aria-expanded={isOpen}
        >
          {selectedTrack}
          <i className="p-icon--chevron-down u-float-right"></i>
        </div>
        {isOpen && (
          <div className="dropdown-menu">
            <div className="options-container">
              {tracks.map((option, index) => (
                <div
                  key={index}
                  role="option"
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedTrack(option);
                    setIsOpen(false);
                  }}
                >
                  <div>
                    {option}
                    {option === defaultTrack && (
                      <div className="p-status-label">Default</div>
                    )}
                  </div>
                  {option === selectedTrack && (
                    <i className="p-icon--task-outstanding u-float-right"></i>
                  )}
                </div>
              ))}
            </div>
            <div className="track-button">
              <Button
                className="p-button has-icon new-track-button"
                type="button"
                onClick={() => {
                  if (hasGuardrails) {
                    onAddTrack?.();
                  } else {
                    onRequestTrack?.();
                  }
                  setIsOpen(false);
                }}
              >
                <i className="p-icon--plus"></i>
                <span>{hasGuardrails ? "Add" : "Request"} track</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
