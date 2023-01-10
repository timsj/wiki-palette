import { Pixel, quantize } from "./quantize";
import { ColorPalette } from "../types";

export const debounce = (func: Function, delay = 1000) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const getRgbArray = (imgData: Uint8ClampedArray): Pixel[] => {
  // convert image data array into array of RBG values per pixel
  // [[R,G,B], [R,G,B]...]
  const rgbArray = [];
  // loop every 4 elements [...r, g, b, a...]
  for (let i = 0; i < imgData.length; i += 4) {
    rgbArray.push([imgData[i], imgData[i + 1], imgData[i + 2]]);
  }
  return rgbArray;
};

export const createColorPalette = (
  imgData: Uint8ClampedArray,
  maxColors: number
): ColorPalette[] => {
  // generate RGB array for each pixel
  const rgbArray = getRgbArray(imgData);
  // create color map using modified median cut quantization
  const cmap = quantize(rgbArray, maxColors);
  // generate color palette and strip array of PQueue class function properties
  // to avoid React devtools error "Uncaught DOMException: Function object could not be cloned"
  const palette = cmap.palette();
  let cleanPalette: ColorPalette[] = [];
  palette.forEach((el) => cleanPalette.push(el));

  return cleanPalette;
};

export const sortByLuminance = (palette: ColorPalette[]): ColorPalette[] => {
  const calcRelativeLuminance = (color: Pixel) => {
    // https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
    const linearRGB = color.map((n) => {
      // normalize 8-bit RGB values
      let norm = n / 255;
      // convert from gamma-compressed to linear RGB
      if (norm <= 0.04045) {
        return norm / 12.92;
      } else {
        return Math.pow((norm + 0.055) / 1.055, 2.4);
      }
    });

    // calculate relative luminance
    const [R, G, B] = linearRGB;
    const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return luminance;
  };

  // return new sorted palette by descending luminance
  return [...palette].sort((c1, c2) => {
    return calcRelativeLuminance(c2) - calcRelativeLuminance(c1);
  });
};

export const changeThemeColor = (palette: ColorPalette[]) => {
  //grab dominant color from generated color palette
  const [r, g, b] = palette[0];

  //change html theme-color meta value
  const metaThemeColor = document.querySelector("meta[name=theme-color]");
  metaThemeColor?.setAttribute("content", `rgb(${r},${g},${b})`);
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const rgbToHSL = (r: number, g: number, b: number): string => {
  // normalize 8-bit RGB values
  r /= 255;
  g /= 255;
  b /= 255;

  // find min/max channel values and initialize HSL variables
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  // calculate hue
  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // handle negative hue values
  if (h < 0) h += 360;

  // calculate lightness
  l = (cmax + cmin) / 2;

  // calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // round to 2 decimal places
  s = +s.toFixed(2);
  l = +l.toFixed(2);

  //h: degrees s,l: pct
  return `${h}, ${s}, ${l}`;
};
