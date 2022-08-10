import type { ChangeEvent } from "react";
import { useState, useCallback } from "react";
import ReactDOM from "react-dom";

function App() {
  const [icon, setIcon] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [isSVG, setIsSVG] = useState<boolean>(false);
  const [isCorrectSize, setIsCorrectSize] = useState<boolean>(false);
  const [hasCircleBackground, setHasCircleBackground] = useState<boolean>(
    false
  );
  const [hasSolidBackground, setHasSolidBackground] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    setIcon(null);
    setIsImage(false);
    setIsSVG(false);
    setIsCorrectSize(false);
    setHasCircleBackground(false);
    setHasSolidBackground(false);
  }, []);

  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    handleReset();
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      return;
    }

    setIsImage(true);

    if (file.type === "image/svg+xml") {
      setIsSVG(true);
    }

    const urlReader = new FileReader();
    urlReader.addEventListener("load", (e: any) => {
      if (!e.target || !e.target.result) {
        setIsImage(false);
        return;
      }

      const img = new Image();
      img.addEventListener("load", () => {
        setIcon(e.target.result);
        if (img.width !== 100 || img.height !== 100) {
          setIsCorrectSize(false);
        } else {
          setIsCorrectSize(true);
        }
      });
      img.src = e.target.result;
    });
    urlReader.readAsDataURL(file);
  }, []);

  return (
    <div>
      <button onClick={handleReset}>Reset</button>
      <input type="file" onChange={handleImageChange} />
      {icon && (
        <>
          <img src={icon} />
          <p>Is image: {isImage ? "true" : "false"}</p>
          <p>Is SVG: {isSVG ? "true" : "false"}</p>
          <p>Is correct size: {isCorrectSize ? "true" : "false"}</p>
          <p>
            <b>Please check that:</b>
            <br />
            The icon has a cirular solid background.
          </p>
        </>
      )}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("main-content"));
