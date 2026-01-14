import { ActionType } from "../action-types";
import {
  SearchResults,
  SelectedSummary,
  ColorPalette,
  QuantizeMethod,
} from "../../types";

interface SearchWikiBegin {
  type: ActionType.SEARCH_WIKI_BEGIN;
}

interface SearchWikiSuccess {
  type: ActionType.SEARCH_WIKI_SUCCESS;
  payload: {
    results: SearchResults[];
  };
}

interface SearchWikiError {
  type: ActionType.SEARCH_WIKI_ERROR;
  payload?: {
    msg: string;
  };
}

interface CloseDropdown {
  type: ActionType.CLOSE_DROPDOWN;
}

interface ClearAlert {
  type: ActionType.CLEAR_ALERT;
}

interface GetSummaryBegin {
  type: ActionType.GET_SUMMARY_BEGIN;
}

interface GetSummarySuccess {
  type: ActionType.GET_SUMMARY_SUCCESS;
  payload: {
    summary: SelectedSummary;
  };
}

interface GetSummaryError {
  type: ActionType.GET_SUMMARY_ERROR;
  payload?: {
    msg: string;
  };
}

interface SetBackgroundPalette {
  type: ActionType.SET_BKG_PALETTE;
  payload: {
    bkgPalette: ColorPalette[];
  };
}

interface OpenModal {
  type: ActionType.OPEN_MODAL;
}

interface HideModal {
  type: ActionType.HIDE_MODAL;
}

interface SetQuantizeMethod {
  type: ActionType.SET_QUANTIZE_METHOD;
  payload: {
    method: QuantizeMethod;
  };
}

export type Action =
  | SearchWikiBegin
  | SearchWikiSuccess
  | SearchWikiError
  | CloseDropdown
  | ClearAlert
  | GetSummaryBegin
  | GetSummarySuccess
  | GetSummaryError
  | SetBackgroundPalette
  | OpenModal
  | HideModal
  | SetQuantizeMethod;
