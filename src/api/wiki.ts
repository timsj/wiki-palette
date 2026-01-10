import axios from "axios";
import { SearchResults, SelectedSummary } from "../types";

export const searchWiki = async (searchQuery: string) => {
  const { data } = await axios.get("https://en.wikipedia.org/w/api.php", {
    params: {
      action: "query",
      list: "search",
      format: "json",
      srsearch: searchQuery,
      origin: "*", //handle CORS: https://www.mediawiki.org/wiki/API:Cross-site_requests
    },
  });

  let results: SearchResults[];
  results = data.query.search;

  if (results.length === 0) {
    results = [{ title: "No search results" }];
  }

  return results;
};

export const summaryWiki = async (selectedTitle: string) => {
  const { data } = await axios.get(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${selectedTitle}`
  );

  // https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_
  const { type, title, extract, content_urls } = data;
  const { page: pageURL } = content_urls.desktop;

  // if lead image, display original, higher-res image in summary
  let originalImgURL;
  if (data.originalimage) originalImgURL = data.originalimage.source;

  // quantization time on thumbnail image is much faster compared
  // to original higher-res image, w/ trivial loss in accuracy
  let thumbnailImgURL;
  if (data.thumbnail) thumbnailImgURL = data.thumbnail.source;

  const summary: SelectedSummary = {
    type,
    title,
    extract,
    pageURL,
    originalImgURL,
    thumbnailImgURL,
  };

  return summary;
};

export const randomWiki = async () => {
  // Fetch multiple random articles with image info, filter to those with images
  const { data } = await axios.get("https://en.wikipedia.org/w/api.php", {
    params: {
      action: "query",
      generator: "random",
      grnnamespace: 0, // Main/article namespace
      grnlimit: 20, // Fetch 20 random articles
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: 100, // Small size just for checking existence
      format: "json",
      origin: "*",
    },
  });

  const pages = Object.values(data.query.pages) as Array<{
    title: string;
    thumbnail?: { source: string };
  }>;

  // Filter to pages that have a thumbnail image
  const pagesWithImages = pages.filter((page) => page.thumbnail);

  if (pagesWithImages.length > 0) {
    return pagesWithImages[0].title;
  }

  // Fallback if none have images (rare with 20 articles)
  return pages[0].title;
};
