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
  // future: figure out how to only query for random pages with a lead image

  const { data } = await axios.get("https://en.wikipedia.org/w/api.php", {
    params: {
      action: "query",
      list: "random",
      format: "json",
      rnnamespace: 0, // Main/article namespace: https://en.wikipedia.org/wiki/Wikipedia:Namespace
      rnlimit: 1, // Limit response to 1 random result
      origin: "*",
    },
  });

  const title: string = data.query.random[0].title;
  return title;
};
