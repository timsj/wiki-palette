import styled from "styled-components";
import { RiGithubLine, RiHeart2Line } from "react-icons/ri";

const Footer = () => {
  return (
    <Styled className="footer text-small">
      <a
        className="footer-link"
        href="https://github.com/timsj/wiki-palette"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiGithubLine />
        &nbsp;Code on GitHub
      </a>
      <div className="separator">|</div>
      <a
        className="footer-link"
        href="https://donate.wikimedia.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiHeart2Line />
        &nbsp;Donate to Wikipedia
      </a>
    </Styled>
  );
};

const Styled = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);

  a {
    color: var(--gray-200);
    display: inline-flex;
    align-items: center;
  }

  a:hover {
    color: var(--gray-400);
  }

  .separator {
    display: flex;
    align-items: center;
    margin: 0 0.5rem;
    color: var(--gray-200);
    font-weight: 600;
  }
`;

export default Footer;
