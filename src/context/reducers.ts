import { Action } from "./actions";
import { ActionType } from "./action-types";
import { GlobalState } from "./appContext";

const reducers = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case ActionType.SEARCH_WIKI_BEGIN:
      return { ...state, isSearchLoading: true, showDropdown: true };
    case ActionType.SEARCH_WIKI_SUCCESS:
      return {
        ...state,
        isSearchLoading: false,
        results: action.payload.results,
      };
    case ActionType.SEARCH_WIKI_ERROR:
      return {
        ...state,
        isSearchLoading: false,
        showAlert: true,
        alertType: "danger",
        alertText: "Error retrieving search results from Wikipedia API",
      };
    case ActionType.CLOSE_DROPDOWN:
      return { ...state, showDropdown: false, results: [] };
    case ActionType.CLEAR_ALERT:
      return {
        ...state,
        showAlert: false,
        alertType: "",
        alertText: "",
      };
    case ActionType.GET_SUMMARY_BEGIN:
      return {
        ...state,
        isSummaryLoading: true,
        // Keep previous summary visible (blurred) while loading
      };
    case ActionType.GET_SUMMARY_SUCCESS:
      return {
        ...state,
        summary: action.payload.summary,
      };
    case ActionType.GET_SUMMARY_ERROR:
      return {
        ...state,
        isSummaryLoading: false,
        showAlert: true,
        alertType: "danger",
        alertText: "Error retrieving page data from Wikipedia API",
      };
    case ActionType.SET_BKG_PALETTE:
      return { ...state, bkgPalette: action.payload.bkgPalette };
    case ActionType.OPEN_MODAL:
      return { ...state, isModalOpen: true };
    case ActionType.HIDE_MODAL:
      return { ...state, isModalOpen: false };
    case ActionType.SET_QUANTIZE_METHOD:
      return { ...state, quantizeMethod: action.payload.method };
    case ActionType.SET_SUMMARY_LOADING:
      return { ...state, isSummaryLoading: action.payload.isLoading };
    default:
      return state;
  }
};

export default reducers;
