import { useEffect, useRef, useState } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { CgClose } from "react-icons/cg";

import { useModalState } from "../context/appContext";
import styles from "./Modal.module.css";

const ANIMATION_DURATION = 200;

const Modal = () => {
  const { closeModal } = useModalState();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal && closeModal();
    }, ANIMATION_DURATION);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={`${styles.dialog} ${isClosing ? styles.closing : ""}`}
    >
      <div className={styles.content}>
        <button
          type="button"
          className={`btn btn-alt ${styles.closeBtn}`}
          onClick={handleClose}
        >
          <CgClose />
        </button>
        <div className={styles.scrollable}>
          <p className={styles.text}>
            The color palettes shown here return up to 16 of the most dominant
          colors in a given image. They are generated using{" "}
          <a
            className={styles.externalLink}
            href="https://en.wikipedia.org/wiki/Color_quantization"
            target="_blank"
            rel="noopener noreferrer"
          >
            color quantization&nbsp;
            <RiExternalLinkLine />
          </a>{" "}
          methods based on the following algorithms:{" "}
          <a
            className={styles.externalLink}
            href="http://www.leptonica.org/papers/colorquant.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            octree&nbsp;
            <RiExternalLinkLine />
          </a>{" "}
          and{" "}
          <a
            className={styles.externalLink}
            href="http://www.leptonica.org/papers/mediancut.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            modified median cut (MMC)&nbsp;
            <RiExternalLinkLine />
          </a>
        </p>
        <p className={styles.text}>
          By default, the palettes are sorted by dominance, meaning that the
          top-left color appears most frequently in the input image, whereas the
          the bottom-right color appears least frequently.
        </p>
        <p className={styles.text}>
          You may notice that when using the octree method, there may be fewer
          than 16 colors in the palette. This is expected, as octree
          quantization may stop early if the image's colors collapse into fewer
          distinct clusters, whereas MMC always partitions the color space into
          a fixed number of regions.
        </p>
        <p className={styles.text} style={{ marginBottom: "0.5rem" }}>
          Optionally, palettes can be sorted by{" "}
          <a
            className={styles.externalLink}
            href="https://www.w3.org/WAI/GL/wiki/Relative_luminance"
            target="_blank"
            rel="noopener noreferrer"
          >
            relative luminance&nbsp;
            <RiExternalLinkLine />
          </a>
          . This means that the colors of any given palette will be sorted
          relative to a reference white from lightest to darkest, top-left to
          bottom-right.
        </p>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
