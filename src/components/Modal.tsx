import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { RiExternalLinkLine } from "react-icons/ri";
import { CgClose } from "react-icons/cg";

import { useAppContext } from "../context/appContext";

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
    <Styled ref={dialogRef} onClick={handleBackdropClick} className={isClosing ? "closing" : ""}>
      <div className="modal-content">
        <div className="btn-container">
          <button
            type="button"
            className="btn btn-alt"
            onClick={handleClose}
          >
            <CgClose />
          </button>
        </div>
        <p className="modal-text" style={{ marginTop: "0.5rem" }}>
          The color palettes shown here are generated with{" "}
          <a
            className="external-link"
            href="https://en.wikipedia.org/wiki/Color_quantization"
            target="_blank"
            rel="noopener noreferrer"
          >
            color quantization&nbsp;
            <RiExternalLinkLine />
          </a>{" "}
          using a method based on the{" "}
          <a
            className="external-link"
            href="http://www.leptonica.org/papers/mediancut.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            modified median cut&nbsp;
            <RiExternalLinkLine />
          </a>{" "}
          algorithm created by Dan Bloomberg.
        </p>
        <p className="modal-text">
          By default, the palettes are sorted by dominance, meaning that the
          left-most color appears most frequently in the input image, whereas
          the right-most color appears least frequently.
        </p>
        <p className="modal-text" style={{ marginBottom: "0.5rem" }}>
          Optionally, palettes can be sorted by{" "}
          <a
            className="external-link"
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
    </Styled>
  );
};

const Styled = styled.dialog`
  /* Fill viewport to act as clickable backdrop */
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  border: none;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn ${ANIMATION_DURATION}ms ease-out;

  &.closing {
    animation: fadeOut ${ANIMATION_DURATION}ms ease-out forwards;
  }

  &::backdrop {
    display: none;
  }

  .modal-content {
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    border-radius: var(--border-radius-lg);
    padding: 1rem 2rem;
    animation: scaleIn ${ANIMATION_DURATION}ms ease-out;
  }

  &.closing .modal-content {
    animation: scaleOut ${ANIMATION_DURATION}ms ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); }
    to { transform: scale(1); }
  }

  @keyframes scaleOut {
    from { transform: scale(1); }
    to { transform: scale(0.95); }
  }

  .modal-text {
    color: var(--gray-200);
  }

  .external-link {
    display: inline-flex;
    align-items: center;
    color: #4f7d9e;
  }

  .btn-container {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }

  button {
    background: transparent;
    box-shadow: none;
    padding: 0.25rem;
  }

  @media (max-width: 350px) {
    .modal-text {
      font-size: var(--small);
    }
  }
`;

export default Modal;
