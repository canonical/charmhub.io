import { useEffect, useState } from "react";
import {
  Button,
  Modal as CanonicalModal,
  Spinner,
} from "@canonical/react-components";
import type { Props as ModalProps } from "@canonical/react-components/dist/components/Modal/Modal";

type ShareBadgeModalProps = {
  close: () => void;
  packageName: string;
  packageTitle?: string;
  releaseChannel: string;
  revision: number;
};

type BadgeData = {
  badgeAlt: string;
  badgeSrc: string;
  htmlSnippet: string;
  markdownSnippet: string;
  packageUrl: string;
};

type CodeSnippetProps = {
  code: string;
  label: string;
};

const Modal = (props: ModalProps): JSX.Element => {
  return CanonicalModal(props) as unknown as JSX.Element;
};

function getBadgeData(
  packageName: string,
  title: string | undefined,
  releaseChannel: string,
  revision: number
): BadgeData {
  const encodedChannel = encodeURIComponent(releaseChannel);
  const encodedRevision = encodeURIComponent(revision);
  const badgeTitle = title || packageName;
  const packageUrl = `https://charmhub.io/${packageName}?channel=${encodedChannel}`;
  const badgeUrl = `https://charmhub.io/${packageName}/badge.svg?channel=${encodedChannel}&revision=${encodedRevision}`;

  return {
    badgeAlt: `${packageName} ${releaseChannel} revision ${revision} GitHub badge`,
    badgeSrc: `/${packageName}/badge.svg?channel=${encodedChannel}&revision=${encodedRevision}`,
    htmlSnippet: `<a href="${packageUrl}">\n  <img alt="" src="${badgeUrl}" />\n</a>`,
    markdownSnippet: `[![${badgeTitle} ${releaseChannel} revision ${revision}](\n  ${badgeUrl}\n)](${packageUrl})`,
    packageUrl: `/${packageName}?channel=${encodedChannel}`,
  };
}

function resetCopyFlag(duration = 2000) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsActive(false);
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [duration, isActive]);

  return [isActive, setIsActive] as const;
}

function CodeSnippet({ code, label }: CodeSnippetProps) {
  const [isCopied, setIsCopied] = resetCopyFlag();

  return (
    <div className="p-code-snippet">
      <div
        className="p-code-snippet__header"
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h5 className="p-code-snippet__title u-no-margin--bottom">{label}</h5>
        <button
          type="button"
          className="p-button--base has-icon is-small u-no-margin--bottom"
          aria-label={`Copy ${label} snippet`}
          disabled={isCopied}
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
          }}
        >
          {isCopied ? (
            <span>Copied</span>
          ) : (
            <i className="p-icon--copy" aria-hidden="true">
              Copy to clipboard
            </i>
          )}
        </button>
      </div>
      <pre className="p-code-snippet__block is-wrapped">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ShareBadgeModal({
  close,
  packageName,
  packageTitle,
  releaseChannel,
  revision,
}: ShareBadgeModalProps) {
  const badgeData = getBadgeData(
    packageName,
    packageTitle,
    releaseChannel,
    revision
  );
  const [isBadgeLoading, setIsBadgeLoading] = useState(true);
  const charmhubLink = `https://charmhub.io${badgeData.packageUrl}`;

  useEffect(() => {
    setIsBadgeLoading(true);
  }, [badgeData.badgeSrc]);

  return (
    <Modal
      close={close}
      title={`Share ${packageName} ${releaseChannel}`}
      buttonRow={
        <Button className="u-no-margin--bottom" onClick={close}>
          Close
        </Button>
      }
    >
      <h5>Charmhub link</h5>
      <div className="u-sv3" style={{ display: "flex" }}>
        <label className="u-off-screen" htmlFor="charmhub-link-read-only">
          Charmhub link
        </label>
        <input
          type="text"
          readOnly
          value={charmhubLink}
          name="charmhub-link-read-only"
          id="charmhub-link-read-only"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(charmhubLink);
          }}
        >
          <i className="p-icon--copy">Copy link</i>
        </button>
      </div>
      <hr />
      <h5>Github badge</h5>
      <p>{isBadgeLoading && <Spinner text="Loading badge..." />}</p>
      <div className="u-sv2">
        <a href={badgeData.packageUrl}>
          <img
            src={badgeData.badgeSrc}
            alt={badgeData.badgeAlt}
            hidden={isBadgeLoading}
            onLoad={() => setIsBadgeLoading(false)}
          />
        </a>
      </div>
      <CodeSnippet code={badgeData.htmlSnippet} label="HTML" />
      <CodeSnippet code={badgeData.markdownSnippet} label="Markdown" />
    </Modal>
  );
}

export default ShareBadgeModal;
