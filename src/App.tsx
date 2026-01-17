import { useState, useEffect, useRef } from "react";
import {
  Loading,
  Alert,
  SearchBar,
  Summary,
  Background,
  Palette,
  Logo,
  Footer,
  Modal,
} from "./components";
import { useAppContext } from "./context/appContext";
import { SelectedSummary } from "./types";
import styles from "./components/App.module.css";

const App = () => {
  const { isSummaryLoading, showAlert, summary, isModalOpen } = useAppContext();

  // Track the currently displayed summary (updates only after image preloads)
  const [displayedSummary, setDisplayedSummary] = useState<SelectedSummary | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const preloadingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!summary) {
      setDisplayedSummary(null);
      return;
    }

    // If this is the same summary we're already displaying, skip
    if (displayedSummary && summary.title === displayedSummary.title) {
      return;
    }

    // If we're already preloading this exact summary, skip
    if (preloadingRef.current === summary.title) {
      return;
    }

    if (summary.originalImgURL) {
      // Preload the image before showing the new summary
      preloadingRef.current = summary.title;
      setIsImageLoading(true);

      const img = new Image();
      img.src = summary.originalImgURL;

      const handleLoad = () => {
        // Only update if this is still the summary we want
        if (preloadingRef.current === summary.title) {
          setDisplayedSummary(summary);
          setIsImageLoading(false);
          preloadingRef.current = null;
        }
      };

      img.onload = handleLoad;
      img.onerror = handleLoad; // Show summary even if image fails
    } else {
      // No image to preload, update immediately
      setDisplayedSummary(summary);
      setIsImageLoading(false);
      preloadingRef.current = null;
    }
  }, [summary]);

  // Combined loading state: API loading OR image preloading
  const isLoading = isSummaryLoading || isImageLoading;

  return (
    <main className={styles.main}>
      <Background />
      {isModalOpen && <Modal />}
      <div className={`${styles.content} ${displayedSummary || isLoading ? styles.expanded : ""}`}>
        <div className={`card ${styles.topContainer}`}>
          <div className={styles.logoContainer}>
            <Logo />
          </div>
          <SearchBar
            name="wiki-search"
            labelText="Search Wikipedia"
            placeholder="Enter search query here"
          />
          {showAlert && <Alert />}
        </div>
        <div className={`${styles.resultsContainer} ${displayedSummary || isLoading ? styles.hasSummary : ""}`}>
          {isLoading && !displayedSummary ? (
            <div className={`card ${styles.summaryLoading}`}>
              <Loading center />
            </div>
          ) : (
            displayedSummary && (
              <div className={styles.summaryWrapper}>
                <Summary key={displayedSummary.title} data={displayedSummary} isLoading={isLoading} />
                {isLoading && (
                  <div className={styles.summaryOverlay}>
                    <Loading center />
                  </div>
                )}
              </div>
            )
          )}
          <Palette />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default App;
