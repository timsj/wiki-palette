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

export type Pixel = [number, number, number]; // [R, G, B] for a single pixel
export type RGB = Pixel; // extracted color from palette

export type QuantizeMethod = "mmc" | "octree";
