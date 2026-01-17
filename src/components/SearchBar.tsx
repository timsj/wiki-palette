import { useState, useEffect, useCallback, useRef } from "react";
import { FaRandom } from "react-icons/fa";
import { CgClose } from "react-icons/cg";

import { Loading } from ".";
import { debounce } from "../utils";
import { useAppContext } from "../context/appContext";
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
  } = useAppContext();

  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement | null>(null);
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
    if (search && query) search(query);
    // resets searchbar if query is deleted
    if (!query) resetSearch();
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setQuery(e.target.value);

  const debouncedHandleChange = useCallback(debounce(handleChange, 1000), []);

  const resetSearch = useCallback(() => {
    // close dropdown
    closeDropdown && closeDropdown();
    // reset search result focused index
    setFocusedIndex(-1);
  }, []);

  const handleSelection = (selectedIndex: number) => {
    // return selected result and fetch summary
    const selectedResult = results[selectedIndex];
    if (!selectedResult) return resetSearch();
    getSummary && getSummary(false, selectedResult.title);
    // remove keyboard focus from input
    inputRef.current?.blur();
    // reset search
    resetSearch();
  };

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
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      resetSearch();
    }
  };

  const renderResults = results?.map((result, i) => {
    if (result.title === "No search results") {
      return (
        <li key={0} className={styles.noResults}>
          No search results
        </li>
      );
    }
    return (
      <li
        key={i}
        onMouseEnter={() => setFocusedIndex(i)}
        onClick={() => handleSelection(i)}
        ref={i === focusedIndex ? resultRef : null}
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

  const handleRandom = () => {
    getSummary && getSummary(true);
    resetSearch();
  };

  const debouncedHandleRandom = useCallback(debounce(handleRandom, 250), []);

  return (
    <div
      className={styles.container}
      tabIndex={1}
      onKeyDown={handleKeyDown}
      ref={searchRef}
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
