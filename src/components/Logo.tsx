import styles from "./Logo.module.css";

const Logo = () => {
  const handleClick = () => {
    window.location.reload();
  };

  return (
    <h1 className={styles.logo} onClick={handleClick}>
      <img src="/apple-touch-icon.png" alt="" className={styles.icon} />
      <span>Wiki&nbsp;</span>
      <span>Palette</span>
    </h1>
  );
};

export default Logo;
