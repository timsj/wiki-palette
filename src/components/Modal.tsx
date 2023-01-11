import { useEffect, useRef } from "react";
import styled from "styled-components";
import { Element } from "react-scroll";
import { RiExternalLinkLine } from "react-icons/ri";
import { CgClose } from "react-icons/cg";

import { useAppContext } from "../context/appContext";

const Modal = () => {
  const { closeModal } = useAppContext();
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // enables ability for user to click outside of modal to hide modal
    document.addEventListener("mousedown", handleClickOutside);
    // cleanup function
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    // closes dropdown if click is registered outside of the modal
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal && closeModal();
    }
  };

  return (
    <Styled>
      <div className="modal-content" ref={modalRef}>
        <Element name="modal-scroll" />
        <div className="btn-container">
          <button
            type="button"
            className="btn btn-alt"
            onClick={() => closeModal && closeModal()}
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

const Styled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  transition: var(--transition);
  z-index: 1000;
  cursor: pointer;

  .modal-content {
    position: relative;
    cursor: auto;
    background: rgba(0, 0, 0, 0.5);
    border-radius: var(--border-radius-lg);
    padding: 1rem 2rem;
    margin: 0 1rem;
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
