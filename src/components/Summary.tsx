import { useEffect, useRef, useState } from "react";
import { RiExternalLinkLine } from "react-icons/ri";

import { useAppContext } from "../context/appContext";
import { SelectedSummary } from "../types";
import { createColorPalette, changeThemeColor } from "../utils";
import ImageModal from "./ImageModal";
import styles from "./Summary.module.css";

interface SelectedSummaryProps {
  data: SelectedSummary;
  isLoading?: boolean;
}

const Summary = ({ data, isLoading }: SelectedSummaryProps) => {
  const { type, title, extract, pageURL, originalImgURL, thumbnailImgURL } =
    data;
  const { setBackground, quantizeMethod, setSummaryLoading } = useAppContext();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const imgDataRef = useRef<ImageData | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (thumbnailImgURL) {
      // if there is a lead image, handle image
      handleImage();
    } else {
      // if no image, set empty background color palette and default meta theme
      setBackground([]);
      changeThemeColor([[255, 255, 254]]);
      setSummaryLoading(false);
    }
  }, [thumbnailImgURL]);

  const handleImage = () => {
    // create canvas context with willReadFrequently for better getImageData performance
    const context = canvas.current?.getContext("2d", { willReadFrequently: true });

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

        // store image data for re-quantization when method changes
        if (imgData) {
          imgDataRef.current = imgData;

          // send image data to palette creation function
          const palette = createColorPalette(
            imgData.data,
            16,
            quantizeMethod
          );
          setBackground(palette);
          changeThemeColor(palette);
        }
        setSummaryLoading(false);
      }
    };
  };

  // re-extract palette when quantization method changes
  useEffect(() => {
    if (imgDataRef.current) {
      const palette = createColorPalette(
        imgDataRef.current.data,
        16,
        quantizeMethod
      );
      setBackground(palette);
      changeThemeColor(palette);
    }
  }, [quantizeMethod]);

  if (type === "disambiguation") {
    return (
      <div className={`card ${styles.summary}`}>
        <h5>{title}</h5>
        <p>
          This is a{" "}
          <a href={pageURL} target="_blank" rel="noopener noreferrer">
            disambiguation page
          </a>
          . Please search again and select a page with a non-ambiguous title.
        </p>
      </div>
    );
  }

  return (
    <div className={`card ${styles.summary} ${isLoading ? styles.blurred : styles.animate}`}>
      <h5>{title}</h5>
      {originalImgURL && (
        <img
          className={`img ${styles.imgSummary}`}
          src={originalImgURL}
          alt={title}
          onClick={() => setShowImageModal(true)}
        />
      )}
      {showImageModal && originalImgURL && (
        <ImageModal
          src={originalImgURL}
          alt={title}
          onClose={() => setShowImageModal(false)}
        />
      )}
      <canvas className="canvas hidden" ref={canvas}></canvas>
      <p>{extract}</p>
      <div className={styles.linkContainer}>
        <a
          className={`btn btn-switch ${styles.externalLink}`}
          href={pageURL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the full page on Wikipedia&nbsp;
          <RiExternalLinkLine />
        </a>
      </div>
    </div>
  );
};

export default Summary;
