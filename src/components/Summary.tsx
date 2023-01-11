import { useEffect, useRef } from "react";
import styled from "styled-components";
import { RiExternalLinkLine } from "react-icons/ri";

import { useAppContext } from "../context/appContext";
import { SelectedSummary } from "../types";
import { createColorPalette, changeThemeColor } from "../utils";

interface SelectedSummaryProps {
  data: SelectedSummary;
}

const Summary = ({ data }: SelectedSummaryProps) => {
  const { type, title, extract, pageURL, originalImgURL, thumbnailImgURL } =
    data;
  const { setBackground } = useAppContext();
  const canvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // if there is a lead image, handle image
    if (thumbnailImgURL) handleImage();
    // if no image, set empty background color palette and default meta theme
    setBackground && setBackground([]);
    changeThemeColor([[255, 255, 254]]);
  }, [thumbnailImgURL]);

  const handleImage = () => {
    // create canvas context
    const context = canvas.current?.getContext("2d");

    // create new img variable and set src as thumbnail URL
    const image = new Image();
    image.crossOrigin = "anonymous"; // avoid CORS issue
    image.src = thumbnailImgURL;

    image.onload = () => {
      if (canvas.current) {
        // on image load, set canvas w and h to img w and h
        canvas.current.width = image.width;
        canvas.current.height = image.height;

        // draw image in canvas and get image data
        context?.drawImage(image, 0, 0);
        const imgData = context?.getImageData(
          0,
          0,
          canvas.current.width,
          canvas.current.height
        );

        // send image data to palette creation function
        if (imgData && setBackground) {
          const palette = createColorPalette(imgData.data, 4);
          setBackground(palette);
          changeThemeColor(palette);
        }
      }
    };
  };

  if (type === "disambiguation") {
    return (
      <Styled>
        <h4>{title}</h4>
        <p>
          This is a{" "}
          <a href={pageURL} target="_blank" rel="noopener noreferrer">
            disambiguation page
          </a>
          , please search again and select a page with a non-ambiguous title.
        </p>
      </Styled>
    );
  }

  return (
    <Styled>
      <h4>{title}</h4>
      {originalImgURL && (
        <img className="img img-summary" src={originalImgURL} alt={title} />
      )}
      <canvas className="canvas hidden" ref={canvas}></canvas>
      <p>{extract}</p>
      <a
        className="external-link"
        href={pageURL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read the full page on Wikipedia&nbsp;
        <RiExternalLinkLine />
      </a>
    </Styled>
  );
};

const Styled = styled.div`
  padding: 5%;
  border: transparent;
  border-radius: var(--border-radius-lg);
  backdrop-filter: var(--blur);
  box-shadow: var(--shadow-2);
  margin-top: 1em;

  h4 {
    text-align: center;
  }

  p {
    margin: 1rem 0;
  }

  .img-summary {
    border: transparent;
    border-radius: var(--border-radius-sm);
    margin-left: auto;
    margin-right: auto;
    max-height: 40vh;
  }

  .external-link {
    display: flex;
    align-items: center;
    width: fit-content;
  }
`;

export default Summary;
