import styled from "styled-components";

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

const App = () => {
  const { isSummaryLoading, showAlert, summary, isModalOpen } = useAppContext();

  return (
    <Styled>
      <Background />
      {isModalOpen && <Modal />}
      <div className="content">
        <div className="top-container">
          <div className="logo-container">
            <Logo />
          </div>
          <SearchBar
            name="wiki-search"
            labelText="Search Wikipedia"
            placeholder="Enter search query here"
          />
          {showAlert && <Alert />}
        </div>
        {isSummaryLoading && (
          <div className="summary-loading">
            <Loading center />
          </div>
        )}
        {summary && <Summary data={summary} />}
        <Palette />
      </div>
      <Footer />
    </Styled>
  );
};

const Styled = styled.main`
  position: relative;
  min-height: 100vh;
  /* mobile viewport bug fix */
  min-height: -webkit-fill-available;

  .content {
    padding: 1rem 0;
    margin: 0 auto;
    min-width: 300px;
    width: var(--fluid-width);
    max-width: var(--fixed-width);
  }

  .top-container {
    position: relative;
    z-index: 100;
    padding: 5%;
    border: transparent;
    border-radius: var(--border-radius-lg);
    backdrop-filter: var(--blur);
    box-shadow: var(--shadow-2);
  }

  .logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .logo {
    width: 50vw;
    max-width: 225px;
  }

  .summary-loading {
    margin: 10% 0;
  }
`;

export default App;
