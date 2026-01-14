import { useEffect } from "react";
import { useAppContext } from "../context/appContext";

const Background = () => {
  const { bkgPalette } = useAppContext();

  useEffect(() => {
    // store up to three dominant colors from generated palette
    const [color1, color2, color3] = bkgPalette;
    // default background from index.css
    let bkg = "var(--background)";

    // create linear gradient background with colors
    if (color1) {
      // use color1 as fallback for missing colors
      const c1 = color1;
      const c2 = color2 || color1;
      const c3 = color3 || color2 || color1;
      bkg = `linear-gradient(
        217deg,
        rgba(${c1[0]}, ${c1[1]}, ${c1[2]}, 0.75),
        rgba(${c1[0]}, ${c1[1]}, ${c1[2]}, 0) 80%
      ),
      linear-gradient(
        336deg,
        rgba(${c2[0]}, ${c2[1]}, ${c2[2]}, 0.75),
        rgba(${c2[0]}, ${c2[1]}, ${c2[2]}, 0) 80%
      ),
      linear-gradient(
        127deg,
        rgba(${c3[0]}, ${c3[1]}, ${c3[2]}, 0.75),
        rgba(${c3[0]}, ${c3[1]}, ${c3[2]}, 0) 80%
      )`;
    }

    document.body.style.background = bkg;
    document.body.style.transition = "background 0.3s ease-in-out";
  }, [bkgPalette]);

  return null;
};

export default Background;
