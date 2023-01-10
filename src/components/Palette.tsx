import { useState } from "react";
import styled from "styled-components";
import { IoIosCopy, IoIosCheckmarkCircle } from "react-icons/io";
import { TbArrowsSort } from "react-icons/tb";
import { IoMdInformationCircleOutline } from "react-icons/io";

import { useAppContext } from "../context/appContext";
import { sortByLuminance, rgbToHex } from "../utils";
import { ColorPalette } from "../types";

const Palette = () => {
  const [sortColors, setSortColors] = useState(false);
  const [clickedBtn, setClickedBtn] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { bkgPalette, showModal } = useAppContext();

  const defaultPalette = bkgPalette; // already sorted by dominance using quantize func
  const sortedPalette = sortByLuminance(bkgPalette);

  const renderPalette = (palette: ColorPalette[]) => {
    return palette.map((color, i) => {
      const [r, g, b] = color;
      const rgb = `${r}, ${g}, ${b}`;
      const hex = rgbToHex(r, g, b);

      return (
        <div
          key={i}
          className="palette"
          style={{ backgroundColor: `rgb(${rgb})` }}
        >
          <div className="btn-container">
            <button
              key={i}
              type="button"
              className="btn btn-alt text-small"
              data-value={hex}
              onClick={(e) => handleColorClick(e, i)}
            >
              {i === clickedBtn && isCopied ? (
                <>
                  <IoIosCheckmarkCircle /> &nbsp;copied!
                </>
              ) : (
                <>
                  <IoIosCopy /> &nbsp;{hex}
                </>
              )}
            </button>
          </div>
        </div>
      );
    });
  };

  const handleColorClick = async (e: React.MouseEvent, i: number) => {
    setClickedBtn(i);
    const clickedValue = e.currentTarget.getAttribute("data-value");
    // console.log(clickedValue);
    if (clickedValue) {
      await navigator.clipboard.writeText(clickedValue);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    }
  };

  return (
    <Styled>
      <div className="heading">
        <label className="form-label">
          Color Palette&nbsp;{" "}
          <IoMdInformationCircleOutline
            className="info-btn"
            onClick={() => showModal && showModal()}
          />
        </label>
        {bkgPalette.length > 0 && (
          <button
            type="button"
            className="btn btn-hover text-small"
            onClick={() => setSortColors(!sortColors)}
          >
            <TbArrowsSort />
            &nbsp;
            {sortColors ? "Sort by dominance" : "Sort by luminance"}
            &nbsp;
          </button>
        )}
      </div>
      <div className="palette-container">
        {bkgPalette.length > 0 ? (
          renderPalette(sortColors ? sortedPalette : defaultPalette)
        ) : (
          <p className="info-text">
            Search for a Wikipedia article with a lead image to show a generated
            color palette.
          </p>
        )}
      </div>
    </Styled>
  );
};

const Styled = styled.div`
  padding: 5%;
  border: transparent;
  border-radius: var(--border-radius-lg);
  backdrop-filter: var(--blur);
  box-shadow: var(--shadow-2);
  margin-top: 1rem;
  margin-bottom: 2rem;

  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  label {
    display: flex;
    align-items: center;
    margin-bottom: 0;
  }

  .info-btn {
    cursor: pointer;
  }

  .info-text {
    margin-top: -0.5em;
    margin-bottom: 0;
  }

  .palette-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .palette {
    border: transparent;
    width: 120px;
    height: 120px;
  }

  .btn-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    transition: var(--transition);
  }

  .palette-container div:first-child {
    border-radius: 0.5rem 0 0 0.5rem;
  }

  .palette-container div:last-child {
    border-radius: 0 0.5rem 0.5rem 0;
    margin-left: -1px;
  }

  .palette-container div:not(:last-child) {
    border-right: none;
  }

  .palette-container div:only-child {
    border-radius: 0.5rem;
    margin-left: 0;
  }
`;

export default Palette;
