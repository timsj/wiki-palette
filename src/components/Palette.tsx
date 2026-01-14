import { useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

import { useAppContext } from "../context/appContext";
import { sortByLuminance, rgbToHex } from "../utils";
import { ColorPalette } from "../types";
import styles from "./Palette.module.css";

const Palette = () => {
  const [sortColors, setSortColors] = useState(false);
  const [clickedBtn, setClickedBtn] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { bkgPalette, openModal, quantizeMethod, setQuantizeMethod } =
    useAppContext();

  const defaultPalette = bkgPalette; // already sorted by dominance using quantize func
  const sortedPalette = sortByLuminance(bkgPalette);

  const renderPalette = (palette: ColorPalette[]) => {
    const gridSize = 16;
    const boxes = [];

    for (let i = 0; i < gridSize; i++) {
      const color = palette[i];

      if (color) {
        const [r, g, b] = color;
        const rgb = `${r}, ${g}, ${b}`;
        const hex = rgbToHex(r, g, b);

        boxes.push(
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
                {i === clickedBtn && isCopied ? <>copied!</> : hex}
              </button>
            </div>
          </div>
        );
      } else {
        boxes.push(
          <div key={i} className={`${styles.colorBox} ${styles.emptyBox}`} />
        );
      }
    }

    return boxes;
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
        <h5>
          Color Palette&nbsp;
          <IoMdInformationCircleOutline
            className={styles.infoBtn}
            onClick={() => openModal && openModal()}
          />
        </h5>
        {bkgPalette.length > 0 && (
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Quantization method:</span>
            <div className={styles.methodSwitch}>
              <button
                type="button"
                className={`${styles.methodOption} ${
                  quantizeMethod === "octree" ? styles.active : ""
                }`}
                onClick={() => setQuantizeMethod && setQuantizeMethod("octree")}
              >
                Octree
              </button>
              <button
                type="button"
                className={`${styles.methodOption} ${
                  quantizeMethod === "mmc" ? styles.active : ""
                }`}
                onClick={() => setQuantizeMethod && setQuantizeMethod("mmc")}
              >
                MMC
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className={`${styles.paletteContainer} ${
          bkgPalette.length > 0 ? styles.hasPalette : ""
        }`}
      >
        {bkgPalette.length > 0 ? (
          renderPalette(sortColors ? sortedPalette : defaultPalette)
        ) : (
          <p className={styles.infoText}>
            Search for a Wikipedia article with a lead image to show a generated
            color palette.
          </p>
        )}
      </div>
      {bkgPalette.length > 0 && (
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Sort palette by:</span>
          <div className={styles.methodSwitch}>
            <button
              type="button"
              className={`${styles.methodOption} ${
                !sortColors ? styles.active : ""
              }`}
              onClick={() => setSortColors(false)}
            >
              Dominance
            </button>
            <button
              type="button"
              className={`${styles.methodOption} ${
                sortColors ? styles.active : ""
              }`}
              onClick={() => setSortColors(true)}
            >
              Luminance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Palette;
