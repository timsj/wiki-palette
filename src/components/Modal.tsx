import { useEffect, useRef, useState } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { CgClose } from "react-icons/cg";

import { useAppContext } from "../context/appContext";
import styles from "./Modal.module.css";

const ANIMATION_DURATION = 200;

const Modal = () => {
  const { closeModal } = useAppContext();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
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
        <div className={styles.btnContainer}>
          <button
            type="button"
            className={`btn btn-alt ${styles.closeBtn}`}
            onClick={handleClose}
          >
            <CgClose />
          </button>
        </div>
        <p className={styles.text} style={{ marginTop: "0.5rem" }}>
          The color palettes shown here are generated with{" "}
          <a
            className={styles.externalLink}
            href="https://en.wikipedia.org/wiki/Color_quantization"
            target="_blank"
            rel="noopener noreferrer"
          >
            color quantization&nbsp;
            <RiExternalLinkLine />
          </a>{" "}
          using a method based on the{" "}
          <a
            className={styles.externalLink}
            href="http://www.leptonica.org/papers/mediancut.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            modified median cut&nbsp;
            <RiExternalLinkLine />
          </a>{" "}
          algorithm created by Dan Bloomberg.
        </p>
        <p className={styles.text}>
          By default, the palettes are sorted by dominance, meaning that the
          left-most color appears most frequently in the input image, whereas
          the right-most color appears least frequently.
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
          relatively from lightest to darkest, left to right.
        </p>
      </div>
    </dialog>
  );
};

export default Modal;
