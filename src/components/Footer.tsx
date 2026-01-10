import { RiGithubLine, RiHeart2Line } from "react-icons/ri";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <div className={`${styles.footer} text-small`}>
      <a
        href="https://github.com/timsj/wiki-palette"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiGithubLine />
        &nbsp;Code on GitHub
      </a>
      <div className={styles.separator}>|</div>
      <a
        href="https://donate.wikimedia.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiHeart2Line />
        &nbsp;Donate to Wikipedia
      </a>
    </div>
  );
};

export default Footer;
