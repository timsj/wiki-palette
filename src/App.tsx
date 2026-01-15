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
import styles from "./components/App.module.css";

const App = () => {
  const { isSummaryLoading, showAlert, summary, isModalOpen } = useAppContext();

  return (
    <main className={styles.main}>
      <Background />
      {isModalOpen && <Modal />}
      <div className={`${styles.content} ${summary || isSummaryLoading ? styles.expanded : ""}`}>
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
        <div className={`${styles.resultsContainer} ${summary || isSummaryLoading ? styles.hasSummary : ""}`}>
          {isSummaryLoading ? (
            <div className={`card ${styles.summaryLoading}`}>
              <Loading center />
            </div>
          ) : (
            summary && <Summary data={summary} />
          )}
          <Palette />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default App;
