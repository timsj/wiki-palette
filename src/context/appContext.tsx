import React, { useContext, useReducer } from "react";

import { ActionType } from "./action-types";
import reducers from "./reducers";
import { SearchResults, SelectedSummary, ColorPalette } from "../types";
import { searchWiki, summaryWiki, randomWiki } from "../api/wiki";
import { QuantizeMethod } from "../utils";

// set global state types
export interface GlobalState {
  isSearchLoading: boolean;
  isSummaryLoading: boolean;
  showAlert: boolean;
  alertText: string;
  alertType: string;
  search?: (query: string) => Promise<void>;
  results: SearchResults[];
  getSummary?: (isRandom: boolean, title?: string) => Promise<void>;
  summary: SelectedSummary | null;
  showDropdown: boolean;
  closeDropdown?: () => void;
  bkgPalette: ColorPalette[];
  setBackground?: (bkgPalette: ColorPalette[]) => void;
  isModalOpen: boolean;
  openModal?: () => void;
  closeModal?: () => void;
  quantizeMethod: QuantizeMethod;
  setQuantizeMethod?: (method: QuantizeMethod) => void;
}

const initialGlobalState: GlobalState = {
  isSearchLoading: false,
  isSummaryLoading: false,
  showAlert: false,
  alertText: "",
  alertType: "",
  results: [],
  summary: null,
  showDropdown: false,
  bkgPalette: [],
  isModalOpen: false,
  quantizeMethod: "octree",
};

// create app context
const AppContext = React.createContext<GlobalState>(initialGlobalState);

// create app provider
type ProviderChild = {
  children: React.ReactNode;
};

const AppProvider: React.FC<ProviderChild> = ({ children }) => {
  const [globalState, dispatch] = useReducer(reducers, initialGlobalState);

  const clearAlert = (delay?: number | null) => {
    setTimeout(() => {
      dispatch({ type: ActionType.CLEAR_ALERT });
    }, delay || 5000);
  };

  const search = async (query: string) => {
    dispatch({ type: ActionType.SEARCH_WIKI_BEGIN });
    try {
      const results = await searchWiki(query);
      dispatch({ type: ActionType.SEARCH_WIKI_SUCCESS, payload: { results } });
    } catch (error) {
      dispatch({ type: ActionType.SEARCH_WIKI_ERROR });
      clearAlert();
    }
  };

  const getSummary = async (isRandom: boolean, title?: string) => {
    dispatch({ type: ActionType.GET_SUMMARY_BEGIN });
    try {
      if (isRandom) title = await randomWiki();
      if (title) {
        const summary = await summaryWiki(title);
        dispatch({
          type: ActionType.GET_SUMMARY_SUCCESS,
          payload: { summary },
        });
      }
    } catch (error) {
      dispatch({ type: ActionType.GET_SUMMARY_ERROR });
      clearAlert();
    }
  };

  const closeDropdown = () => {
    dispatch({ type: ActionType.CLOSE_DROPDOWN });
  };

  const setBackground = (bkgPalette: ColorPalette[]) => {
    dispatch({ type: ActionType.SET_BKG_PALETTE, payload: { bkgPalette } });
  };

  const openModal = () => {
    dispatch({ type: ActionType.OPEN_MODAL });
  };

  const closeModal = () => dispatch({ type: ActionType.HIDE_MODAL });

  const setQuantizeMethod = (method: QuantizeMethod) => {
    dispatch({ type: ActionType.SET_QUANTIZE_METHOD, payload: { method } });
  };

  return (
    <AppContext.Provider
      value={{
        ...globalState,
        search,
        getSummary,
        closeDropdown,
        setBackground,
        openModal,
        closeModal,
        setQuantizeMethod,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// create reusable useContext hook
const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, useAppContext, initialGlobalState };
