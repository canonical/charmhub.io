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
    htmlSnippet: `<a href="${packageUrl}"><img alt="" src="${badgeUrl}" /></a>`,
    markdownSnippet: `[![${badgeTitle} ${releaseChannel} revision ${revision}](${badgeUrl})](${packageUrl})`,
    packageUrl: `/${packageName}?channel=${encodedChannel}`,
  };
}

function CodeSnippet({ code, label }: CodeSnippetProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isCopied]);

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

export default function ShareBadgeModal({
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
      <p>
        {isBadgeLoading && <Spinner text="Loading badge..." />}
        <a href={badgeData.packageUrl}>
          <img
            src={badgeData.badgeSrc}
            alt={badgeData.badgeAlt}
            hidden={isBadgeLoading}
            onLoad={() => setIsBadgeLoading(false)}
          />
        </a>
      </p>
      <CodeSnippet code={badgeData.htmlSnippet} label="HTML" />
      <CodeSnippet code={badgeData.markdownSnippet} label="Markdown" />
    </Modal>
  );
}
