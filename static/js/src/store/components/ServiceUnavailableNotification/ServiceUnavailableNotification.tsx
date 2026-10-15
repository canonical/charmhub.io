import { useState } from "react";
import { Col, Notification, Row } from "@canonical/react-components";

type Props = {
  service: "Solutions" | "Charms";
};

export const ServiceUnavailableNotification = ({ service }: Props) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <Row>
      <Col size={6}>
        <Notification
          severity="caution"
          title={`${service} Service Unavailable`}
          titleElement="h3"
          role="alert"
          onDismiss={() => setIsDismissed(true)}
        >
          This service is temporarily unavailable. Please try again later.
        </Notification>
      </Col>
    </Row>
  );
};
