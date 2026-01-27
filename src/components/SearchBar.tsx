import { useState, useEffect, useCallback, useRef } from "react";
import { FaRandom } from "react-icons/fa";
import { CgClose } from "react-icons/cg";

import Loading from "./Loading";
import { debounce } from "../utils";
import { useAppContext } from "../context/appContext";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  name: string;
  placeholder?: string;
  labelText?: string;
}

const SearchBar = ({ name, placeholder, labelText }: SearchBarProps) => {
  const {
    isSearchLoading,
    isSummaryLoading,
    search,
    results,
    showDropdown,
    closeDropdown,
    getSummary,
  } = useAppContext();

  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [randomClicked, setRandomClicked] = useState(false);

  useEffect(() => {
    if (!isSummaryLoading) setRandomClicked(false);
  }, [isSummaryLoading]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // enables ability for user to click outside of dropdown to hide dropdown
    document.addEventListener("mousedown", handleClickOutside);
    // cleanup function
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // searches Wikipedia with debounced input
    if (query) search(query);
    // resets searchbar if query is deleted
    if (!query) resetSearch();
  }, [query]);

  const debouncedHandleChange = useRef(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value), 1000)
  ).current;

  const resetSearch = useCallback(() => {
    closeDropdown();
    setFocusedIndex(-1);
  }, [closeDropdown]);

  const handleSelection = useCallback((selectedIndex: number) => {
    const selectedResult = results[selectedIndex];
    if (!selectedResult) {
      resetSearch();
      return;
    }
    getSummary(false, selectedResult.title);
    inputRef.current?.blur();
    resetSearch();
  }, [results, resetSearch, getSummary]);

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

  const renderResults = () =>
    results?.map((result, i) => {
      if (result.title === "No search results") {
        return (
          <li key="no-results" className={styles.noResults}>
            No search results
          </li>
        );
      }
      const key = result.pageid?.toString() ?? result.title;
      return (
        <li
          key={key}
          onMouseEnter={() => setFocusedIndex(i)}
          onClick={() => handleSelection(i)}
          className={i === focusedIndex ? styles.focused : ""}
        >
          {result.title}
        </li>
      );
    });

  const handleClear = () => {
    setQuery(""); // set query state to empty
    resetSearch();
    formRef.current?.reset(); // clear form input text
  };

  const handleRandom = useCallback(() => {
    setRandomClicked(true);
    getSummary(true);
    resetSearch();
  }, [getSummary, resetSearch]);

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
              className={`btn btn-switch text-small ${randomClicked ? styles.loading : ""}`}
              onClick={handleRandom}
              disabled={isSummaryLoading}
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
                renderResults()
              )}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
