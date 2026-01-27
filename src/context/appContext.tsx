import React, { useContext, useReducer } from "react";

import { ActionType } from "./action-types";
import reducers from "./reducers";
import {
  SearchResults,
  SelectedSummary,
  RGB,
  QuantizeMethod,
} from "../types";
import { searchWiki, summaryWiki, randomWiki } from "../api/wiki";

// set global state types
export interface GlobalState {
  isSearchLoading: boolean;
  isSummaryLoading: boolean;
  showAlert: boolean;
  alertText: string;
  alertType: string;
  search: (query: string) => Promise<void>;
  results: SearchResults[];
  getSummary: (isRandom: boolean, title?: string) => Promise<void>;
  summary: SelectedSummary | null;
  showDropdown: boolean;
  closeDropdown: () => void;
  bkgPalette: RGB[];
  setBackground: (bkgPalette: RGB[]) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  quantizeMethod: QuantizeMethod;
  setQuantizeMethod: (method: QuantizeMethod) => void;
  setSummaryLoading: (isLoading: boolean) => void;
}

const initialGlobalState: GlobalState = {
  isSearchLoading: false,
  isSummaryLoading: false,
  showAlert: false,
  alertText: "",
  alertType: "",
  search: async () => {},
  results: [],
  getSummary: async () => {},
  summary: null,
  showDropdown: false,
  closeDropdown: () => {},
  bkgPalette: [],
  setBackground: () => {},
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  quantizeMethod: "octree",
  setQuantizeMethod: () => {},
  setSummaryLoading: () => {},
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

  const setBackground = (bkgPalette: RGB[]) => {
    dispatch({ type: ActionType.SET_BKG_PALETTE, payload: { bkgPalette } });
  };

  const openModal = () => {
    dispatch({ type: ActionType.OPEN_MODAL });
  };

  const closeModal = () => dispatch({ type: ActionType.HIDE_MODAL });

  const setQuantizeMethod = (method: QuantizeMethod) => {
    dispatch({ type: ActionType.SET_QUANTIZE_METHOD, payload: { method } });
  };

  const setSummaryLoading = (isLoading: boolean) => {
    dispatch({ type: ActionType.SET_SUMMARY_LOADING, payload: { isLoading } });
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
        setSummaryLoading,
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
