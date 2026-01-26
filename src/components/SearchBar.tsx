import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FaRandom } from "react-icons/fa";
import { CgClose } from "react-icons/cg";

import Loading from "./Loading";
import { debounce } from "../utils";
import { useSearchState } from "../context/appContext";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  name: string;
  placeholder?: string;
  labelText?: string;
  value?: string;
}

const SearchBar = ({ name, placeholder, labelText }: SearchBarProps) => {
  const {
    isSearchLoading,
    search,
    results,
    showDropdown,
    closeDropdown,
    getSummary,
  } = useSearchState();

  // Stable callback refs to avoid recreating debounced functions
  const searchFnRef = useRef(search);
  const getSummaryRef = useRef(getSummary);
  const closeDropdownRef = useRef(closeDropdown);

  useEffect(() => {
    searchFnRef.current = search;
    getSummaryRef.current = getSummary;
    closeDropdownRef.current = closeDropdown;
  }, [search, getSummary, closeDropdown]);

  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    // enables ability for user to click outside of dropdown to hide dropdown
    document.addEventListener("mousedown", handleClickOutside);
    // cleanup function
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // searches Wikipedia with debounced input
    if (searchFnRef.current && query) searchFnRef.current(query);
    // resets searchbar if query is deleted
    if (!query) resetSearch();
  }, [query]);

  const debouncedHandleChange = useRef(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value), 1000)
  ).current;

  const resetSearch = useCallback(() => {
    // close dropdown
    closeDropdownRef.current?.();
    // reset search result focused index
    setFocusedIndex(-1);
  }, []);

  const handleSelection = useCallback((selectedIndex: number) => {
    // return selected result and fetch summary
    const selectedResult = results[selectedIndex];
    if (!selectedResult) {
      resetSearch();
      return;
    }
    getSummaryRef.current?.(false, selectedResult.title);
    // remove keyboard focus from input
    inputRef.current?.blur();
    // reset search
    resetSearch();
  }, [results, resetSearch]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const { key } = e;
    let nextIndex = 0;

    // logic to allow for key up/down strokes to
    // cycle through any given result array infinitely
    if (key === "ArrowDown") nextIndex = (focusedIndex + 1) % results.length;

    if (key === "ArrowUp")
      nextIndex = (focusedIndex + results.length - 1) % results.length;

    if (key === "Escape") {
      // hide search results
      resetSearch();
    }

    if (key === "Enter") {
      // select the current result
      e.preventDefault();
      handleSelection(focusedIndex);
    }

    setFocusedIndex(nextIndex);
  };

  const handleClickOutside = (e: MouseEvent) => {
    // closes dropdown if click is registered outside of the searchbar ref
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      resetSearch();
    }
  };

  // Memoize event handlers for list items to avoid re-creating functions
  const handleMouseEnter = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleResultClick = useCallback((index: number) => {
    handleSelection(index);
  }, [handleSelection]);

  // Memoize rendered results to avoid recreation on every render
  const renderResults = useMemo(() => {
    return results?.map((result, i) => {
      if (result.title === "No search results") {
        return (
          <li key="no-results" className={styles.noResults}>
            No search results
          </li>
        );
      }
      // Use pageid for stable key, fallback to title
      const key = result.pageid?.toString() ?? result.title;
      return (
        <li
          key={key}
          onMouseEnter={() => handleMouseEnter(i)}
          onClick={() => handleResultClick(i)}
          ref={i === focusedIndex ? resultRef : null}
          className={i === focusedIndex ? styles.focused : ""}
        >
          {result.title}
        </li>
      );
    });
  }, [results, focusedIndex, handleMouseEnter, handleResultClick]);

  const handleClear = () => {
    setQuery(""); // set query state to empty
    resetSearch();
    formRef.current?.reset(); // clear form input text
  };

  const debouncedHandleRandom = useRef(
    debounce(() => {
      getSummaryRef.current?.(true);
      closeDropdownRef.current?.();
      setFocusedIndex(-1);
    }, 250)
  ).current;

  return (
    <div
      className={styles.container}
      tabIndex={1}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      <form
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
        ref={formRef}
      >
        <div className="form-row">
          <div className={styles.heading}>
            {labelText && (
              <label className="form-label" htmlFor={name}>
                {labelText}
              </label>
            )}
            <button
              type="button"
              className="btn btn-switch text-small"
              onClick={debouncedHandleRandom}
            >
              <FaRandom /> &nbsp;Random article
            </button>
          </div>
          <div className={styles.input}>
            <input
              id={name}
              className="form-input"
              type="text"
              name={name}
              placeholder={placeholder}
              onChange={debouncedHandleChange}
              ref={inputRef}
            />
            {query.length > 0 && (
              <button
                type="button"
                className={`btn ${styles.clear}`}
                onClick={() => handleClear()}
              >
                <CgClose />
              </button>
            )}
            <ul className={`${styles.results} ${!showDropdown ? "hidden" : ""}`}>
              {isSearchLoading ? (
                <li>
                  <Loading center />
                </li>
              ) : (
                renderResults
              )}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
