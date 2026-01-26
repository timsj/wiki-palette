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

export type ColorPalette = [number, number, number]; // [R, G, B] for each color in palette

export type Pixel = [number, number, number]; // [R, G, B] for a single pixel

export type QuantizeMethod = "mmc" | "octree";
