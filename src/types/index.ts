export interface SearchResults {
  ns?: number;
  pageid?: number;
  size?: number;
  snippet?: string;
  timestamp?: string;
  title: string;
  wordcount?: number;
}

export interface SelectedSummary {
  type: string;
  title: string;
  extract: string;
  originalImgURL: string;
  thumbnailImgURL: string;
  pageURL: string;
}

export type ColorPalette = number[];
//[R, G, B] for given number of colors in generated palette

export type Pixel = number[]; // [R, G, B] for a single pixel
