import { useState } from "react";
import { IoIosCopy, IoIosCheckmarkCircle } from "react-icons/io";
import { TbArrowsSort } from "react-icons/tb";
import { IoMdInformationCircleOutline } from "react-icons/io";

import { useAppContext } from "../context/appContext";
import { sortByLuminance, rgbToHex } from "../utils";
import { ColorPalette } from "../types";
import styles from "./Palette.module.css";

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
          className={styles.colorBox}
          style={{ backgroundColor: `rgb(${rgb})` }}
        >
          <div className={styles.btnContainer}>
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
    <div className={`card ${styles.palette}`}>
      <div className={styles.heading}>
        <label className="form-label">
          Color Palette&nbsp;{" "}
          <IoMdInformationCircleOutline
            className={styles.infoBtn}
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
      <div className={styles.paletteContainer}>
        {bkgPalette.length > 0 ? (
          renderPalette(sortColors ? sortedPalette : defaultPalette)
        ) : (
          <p className={styles.infoText}>
            Search for a Wikipedia article with a lead image to show a generated
            color palette.
          </p>
        )}
      </div>
    </div>
  );
};

export default Palette;
