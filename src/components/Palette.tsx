import { useState, useMemo, useRef, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

import { useAppContext } from "../context/appContext";
import { sortByLuminance, rgbToHex } from "../utils";
import { ColorPalette } from "../types";
import styles from "./Palette.module.css";

const Palette = () => {
  const [sortColors, setSortColors] = useState(false);
  const [clickedBtn, setClickedBtn] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { bkgPalette, openModal, quantizeMethod, setQuantizeMethod } =
    useAppContext();

  // Create a key that changes when palette updates to trigger animation
  const paletteKey = useMemo(() => {
    if (bkgPalette.length === 0) return "empty";
    return bkgPalette.map((c) => c.join(",")).join("|");
  }, [bkgPalette]);

  // Track palette changes to trigger animation only when palette data changes
  const prevPaletteKey = useRef<string | null>(null);
  useEffect(() => {
    if (paletteKey !== "empty" && paletteKey !== prevPaletteKey.current) {
      setShouldAnimate(true);
      prevPaletteKey.current = paletteKey;
      // Reset after animation completes
      const timer = setTimeout(() => setShouldAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [paletteKey]);

  // Deduplicate palette by hex value
  const uniquePalette = useMemo(() => {
    const seen = new Set<string>();
    return bkgPalette.filter((color) => {
      const hex = rgbToHex(color[0], color[1], color[2]);
      if (seen.has(hex)) return false;
      seen.add(hex);
      return true;
    });
  }, [bkgPalette]);

  const defaultPalette = uniquePalette; // already sorted by dominance using quantize func
  const sortedPalette = sortByLuminance(uniquePalette);

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
          <div key={hex} className={styles.colorBox}>
            <div
              className={`${styles.colorFill} ${shouldAnimate ? styles.animate : ""}`}
              style={{
                backgroundColor: `rgb(${rgb})`,
                viewTransitionName: `color-${hex.slice(1)}`,
              }}
            >
              <div className={styles.btnContainer}>
                <button
                  type="button"
                  className="btn btn-alt text-small"
                  onClick={() => handleColorClick(hex)}
                >
                  {clickedBtn === hex && isCopied ? <>copied!</> : hex}
                </button>
              </div>
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

  const handleColorClick = async (hex: string) => {
    setClickedBtn(hex);
    await navigator.clipboard.writeText(hex);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleSortChange = (sorted: boolean) => {
    // Only use View Transitions on Chromium browsers (Chrome, Edge)
    // Safari's implementation is choppy, Firefox doesn't support it
    const isChromium = 'chrome' in window;

    if (document.startViewTransition && isChromium) {
      document.startViewTransition(() => setSortColors(sorted));
    } else {
      setSortColors(sorted);
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
        key={paletteKey}
        className={`${styles.paletteContainer} ${
          bkgPalette.length > 0 ? styles.hasPalette : ""
        }`}
      >
        {bkgPalette.length > 0 ? (
          renderPalette(sortColors ? sortedPalette : defaultPalette)
        ) : (
          <p className={styles.infoText}>
            Search for a Wikipedia article with a lead image to generate a color
            palette.
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
              onClick={() => handleSortChange(false)}
            >
              Dominance
            </button>
            <button
              type="button"
              className={`${styles.methodOption} ${
                sortColors ? styles.active : ""
              }`}
              onClick={() => handleSortChange(true)}
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
