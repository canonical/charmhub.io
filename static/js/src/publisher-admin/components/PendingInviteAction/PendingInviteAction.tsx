import { useEffect, useRef, useState } from "react";
import { Button, Modal, Notification } from "@canonical/react-components";
import { useQueryClient } from "react-query";

import { generateInviteToken } from "../../utils/generateInviteToken";

type Props = {
  email: string | null;
  packageName: string;
};

function PendingInviteAction({ email, packageName }: Props) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const closeModal = () => {
    if (!inFlight.current) {
      setShowModal(false);
    }
  };

  const resendInvite = async () => {
    if (inFlight.current || !email || inviteLink) {
      return;
    }

    inFlight.current = true;
    setLoading(true);
    setError("");
    try {
      const { inviteLink } = await generateInviteToken(
        email,
        packageName,
        window.CSRF_TOKEN
      );
      setInviteLink(inviteLink);
      queryClient.invalidateQueries("invitesData");
    } catch {
      setError("Unable to resend the invite. Please try again.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (inFlight.current || !inviteLink) {
      return;
    }

    inFlight.current = true;
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setError("Unable to copy the invite URL. Please try again.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  const copyButton = (
    <Button type="button" dense disabled={loading} onClick={copyInviteLink}>
      {copied ? "URL copied!" : "Copy invite URL"}
    </Button>
  );

  return (
    <>
      {inviteLink ? (
        copyButton
      ) : (
        <Button
          type="button"
          dense
          disabled={!email}
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          Resend invite
        </Button>
      )}
      {error && !showModal && (
        <Notification severity="negative">{error}</Notification>
      )}
      {showModal && (
        <Modal
          title={inviteLink ? "Invite sent" : "Resend invite"}
          close={closeModal}
          className="u-align--left"
          buttonRow={
            inviteLink ? (
              <>
                {copyButton}
                <Button type="button" disabled={loading} onClick={closeModal}>
                  Done
                </Button>
              </>
            ) : (
              <>
                <Button type="button" disabled={loading} onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  appearance="positive"
                  disabled={loading}
                  onClick={resendInvite}
                >
                  {loading ? "Sending invite…" : "Resend invite"}
                </Button>
              </>
            )
          }
        >
          {error && <Notification severity="negative">{error}</Notification>}
          {inviteLink ? (
            <>
              <p>
                An email has been sent to <strong>{email}</strong>. You can also
                copy and share the invite URL below.
              </p>
              <pre className="p-code-snippet__block">
                <code>{inviteLink}</code>
              </pre>
            </>
          ) : (
            <>
              <p>The existing invite URL is not available here.</p>
              <p>
                This will create or reissue the invitation for{" "}
                <strong>{email}</strong> and send them an email. Do you want to
                continue?
              </p>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

export default PendingInviteAction;
