import React, { useState, useCallback, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Form,
  Input,
  Row,
  Col,
  Icon,
  Notification,
  ICONS,
} from "@canonical/react-components";

import { useDropzone } from "react-dropzone";

function App() {
  const [icon, setIcon] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [isSVG, setIsSVG] = useState<boolean>(false);
  const [isCorrectSize, setIsCorrectSize] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<number[]>([100, 100]);

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragAccept,
  } = useDropzone({
    maxFiles: 1,
  });

  const handleReset = useCallback(() => {
    setIcon(null);
    setIsImage(false);
    setIsSVG(false);
    setIsCorrectSize(false);
  }, []);

  const isValid = useMemo(() => isImage && isSVG && isCorrectSize, [
    isImage,
    isSVG,
    isCorrectSize,
  ]);

  useEffect(() => {
    if (!acceptedFiles.length) {
      return;
    }
    handleReset();
    const file = acceptedFiles[0];

    if (!file.type.startsWith("image/")) {
      return;
    }

    setIsImage(true);

    if (file.type === "image/svg+xml") {
      setIsSVG(true);
    }

    const urlReader = new FileReader();
    urlReader.addEventListener("load", (e) => {
      if (!e.target || !e.target.result) {
        setIsImage(false);
        return;
      }

      const img = new Image();
      img.addEventListener("load", () => {
        if (e?.target?.result) {
          setIcon(e?.target?.result);
          setImageSize([img.width, img.height]);
          if (img.width !== 100 || img.height !== 100) {
            setIsCorrectSize(false);
          } else {
            setIsCorrectSize(true);
          }
        }
      });
      img.src = e.target.result;
    });
    urlReader.readAsDataURL(file);
  }, [acceptedFiles, handleReset]);

  return (
    <Row>
      <Col size={8} emptyLarge={4}>
        <h1>Charm Icon Validator</h1>
        <p>
          Checks are based on the{" "}
          <a href="https://juju.is/docs/sdk/create-an-icon-for-your-charm">
            Charm Icon Specification
          </a>
          .
        </p>
        <p>Drag and drop, or use the file picker to choose your icon.</p>
        <Form stacked={true} style={{ marginBottom: "1rem" }}>
          <div
            {...getRootProps({ className: "dropzone" })}
            style={{
              outline: isDragAccept
                ? "3px dashed #0e8420"
                : "3px solid transparent",
              borderRadius: "3px",
              display: "block",
            }}
          >
            <Input type="file" />
            <input {...getInputProps()} />
            {icon && (
              <>
                <Row>
                  <Col size={2}>
                    <img src={icon} style={{ maxWidth: "100%" }} />
                  </Col>
                  <Col size={6}>
                    <p>
                      <Icon name={isImage ? ICONS.success : ICONS.error} />{" "}
                      Image
                    </p>
                    <p>
                      <Icon name={isSVG ? ICONS.success : ICONS.error} /> SVG
                    </p>
                    <p>
                      <Icon
                        name={
                          imageSize[0] === 100 ? ICONS.success : ICONS.error
                        }
                      />{" "}
                      Image width is {imageSize[0]}px, not 100px
                    </p>
                    <p>
                      <Icon
                        name={
                          imageSize[1] === 100 ? ICONS.success : ICONS.error
                        }
                      />{" "}
                      Image height is {imageSize[1]}px, not 100px
                    </p>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </Form>
        {icon && (
          <Notification
            severity={isValid ? "positive" : "negative"}
            title={isValid ? "Valid icon" : "Invalid icon"}
          >
            {isValid ? (
              <>
                Based on the automated checks above your icon is valid, but you
                should manually check the{" "}
                <a href="https://juju.is/docs/sdk/create-an-icon-for-your-charm">
                  Charm Icon Specification
                </a>
                .
              </>
            ) : (
              <>
                Based on the automated checks above your icon is not valid.
                Please check the{" "}
                <a href="https://juju.is/docs/sdk/create-an-icon-for-your-charm">
                  Charm Icon Specification
                </a>
                , update your icon, and try again.
              </>
            )}
          </Notification>
        )}
      </Col>
    </Row>
  );
}

ReactDOM.render(<App />, document.getElementById("main-content"));
