import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Icon,
  Notification,
  ICONS,
  Strip,
  Button,
  Navigation,
  Theme,
} from "@canonical/react-components";

import { useDropzone } from "react-dropzone";
import { createRoot } from "react-dom/client";

export default function App() {
  const [icon, setIcon] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [isSVG, setIsSVG] = useState<boolean>(false);
  const [isCorrectSize, setIsCorrectSize] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<number[]>([0, 0]);
  const [hasConstraints, setHasConstraints] = useState<boolean>(true);

  const { acceptedFiles, getRootProps, getInputProps, isDragAccept } =
    useDropzone({
      maxFiles: 1,
    });

  const handleReset = useCallback(() => {
    setIcon(null);
    setIsImage(false);
    setIsSVG(false);
    setIsCorrectSize(false);
    setImageSize([0, 0]);
    setHasConstraints(true);
  }, []);

  const isValid = useMemo(
    () => isImage && isSVG && isCorrectSize && hasConstraints,
    [isImage, isSVG, isCorrectSize, hasConstraints]
  );

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

      const dataURL = e.target.result as string;
      const svgString = window.atob(dataURL.split("base64,")[1]);

      if (svgString.indexOf("<svg") === -1) {
        setIsSVG(false);
        setHasConstraints(false);
      } else {
        const svgImage = document.createElement("div");
        svgImage.innerHTML = svgString;
        const svgEl = svgImage.querySelector("svg");
        const svgElWidth = svgEl?.getAttribute("width");
        const svgElHeight = svgEl?.getAttribute("height");
        const viewBoxSize = svgEl?.getAttribute("viewBox")?.split(" ");

        if (svgElHeight && svgElWidth) {
          setImageSize([parseInt(svgElWidth), parseInt(svgElHeight)]);
        } else if (viewBoxSize && viewBoxSize[2] && viewBoxSize[2]) {
          setImageSize([parseInt(viewBoxSize[2]), parseInt(viewBoxSize[2])]);
        } else {
          setHasConstraints(false);
        }
      }

      const img = new Image();
      img.addEventListener("load", () => {
        setIcon(dataURL);
        if (imageSize[0] === 0 && imageSize[1] === 0) {
          setImageSize([img.width, img.height]);
          if (img.width !== 100 || img.height !== 100) {
            setIsCorrectSize(false);
          } else {
            setIsCorrectSize(true);
          }
        } else {
          if (imageSize[0] !== 100 || imageSize[1] !== 100) {
            setIsCorrectSize(false);
          } else {
            setIsCorrectSize(true);
          }
        }
      });
      img.src = dataURL;
    });
    urlReader.readAsDataURL(file);
  }, [acceptedFiles, handleReset]);
  return (
    <>
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
              <Input type="file" onClick={(e) => e.preventDefault()} />
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
                          name={hasConstraints ? ICONS.success : ICONS.error}
                        />{" "}
                        Root <code>svg</code> element has{" "}
                        <code>width="100"</code> and <code>height="100"</code>{" "}
                        attributes or a valid viewbox of <code>100 100</code>
                      </p>
                      <p>
                        <Icon
                          name={
                            imageSize[0] === 100 ? ICONS.success : ICONS.error
                          }
                        />{" "}
                        Image width is {imageSize[0]}px
                        {imageSize[0] !== 100 ? ", not 100px" : ""}
                      </p>
                      <p>
                        <Icon
                          name={
                            imageSize[1] === 100 ? ICONS.success : ICONS.error
                          }
                        />{" "}
                        Image height is {imageSize[1]}px
                        {imageSize[1] !== 100 ? ", not 100px" : ""}
                      </p>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          </Form>
          {icon && (
            <>
              <Notification
                severity={isValid ? "positive" : "negative"}
                title={isValid ? "Valid icon" : "Invalid icon"}
              >
                {isValid ? (
                  <>
                    Based on the automated checks above your icon is valid, but
                    you should manually check the{" "}
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
              {isValid && <h2>Charmhub.io Preview</h2>}
            </>
          )}
        </Col>
      </Row>
      {icon && isValid && (
        <>
          <Navigation
            theme={Theme.DARK}
            logo={{
              src: "https://assets.ubuntu.com/v1/a603c7c9-Favicon - Juju.svg",
              title: "Charmhub",
              url: "#",
            }}
          />
          <Strip type="light" shallow>
            <Row>
              <Col size={8}>
                <div className="p-media-object--large">
                  <img src={icon} className="p-media-object__image is-round" />
                  <div className="p-media-object__details">
                    <h1 className="p-media-object__title">Your Charm</h1>
                    <div className="p-media-object__content u-no-margin--bottom">
                      <ul className="p-inline-list--middot">
                        <li className="p-inline-list__item">By You!</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div style={{ marginLeft: "-1rem" }}>
                  <Button inline styles={{ marginLeft: 0 }}>
                    stable 10
                  </Button>
                  <code style={{ backgroundColor: "transparent" }}>
                    juju deploy yourcharm --channel stable
                  </code>
                </div>
              </Col>
            </Row>
          </Strip>
        </>
      )}
    </>
  );
}

createRoot(document.getElementById("main-content") as Element).render(<App />);
