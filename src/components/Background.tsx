import { createGlobalStyle } from "styled-components";
import { useAppContext } from "../context/appContext";

interface CustomStyleProps {
  background?: string;
}

const Background = () => {
  const { bkgPalette } = useAppContext();
  // store up to three dominant colors from generated palette
  const [color1, color2, color3] = bkgPalette;
  // default background from index.css
  let bkg = "var(--background)";

  // create linear gradient background with colors
  if (color1 && color2) {
    // use color2 as fallback for color3 if only 2 colors available
    const c3 = color3 || color2;
    bkg = `linear-gradient(
    217deg,
    rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, 0.75),
    rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, 0) 80%
  ),
  linear-gradient(
    336deg,
    rgba(${color2[0]}, ${color2[1]}, ${color2[2]}, 0.75),
    rgba(${color2[0]}, ${color2[1]}, ${color2[2]}, 0) 80%
  ),
  linear-gradient(
    127deg,
    rgba(${c3[0]}, ${c3[1]}, ${c3[2]}, 0.75),
    rgba(${c3[0]}, ${c3[1]}, ${c3[2]}, 0) 80%
  );`;
  }

  return <GlobalStyle background={bkg} />;
};

const GlobalStyle = createGlobalStyle<CustomStyleProps>`
  body {
    background: ${(props) => props.background};
    transition: background 0.3s ease-in-out;
  }
`;

export default Background;
