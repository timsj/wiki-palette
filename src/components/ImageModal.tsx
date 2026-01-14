import { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import styles from "./ImageModal.module.css";

const ANIMATION_DURATION = 200;

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageModal = ({ src, alt, onClose }: ImageModalProps) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
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
        <img className={styles.image} src={src} alt={alt} />
      </div>
    </dialog>
  );
};

export default ImageModal;
