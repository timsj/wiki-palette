import styled from "styled-components";

const Logo = () => {
  return (
    <Styled>
      <img src="/apple-touch-icon.png" alt="" className="logo-icon" />
      <span className="wiki">Wiki&nbsp;</span>
      <span className="palette">Palette</span>
    </Styled>
  );
};

const Styled = styled.h1`
  display: flex;
  align-items: center;
  font-size: 2.5rem;
  margin-bottom: 0;
  user-select: none;
  color: var(--heading);
  transition: color 0.3s ease-in-out;

  .logo-icon {
    width: 1em;
    height: 1em;
    margin-right: 0.3em;
  }
`;

export default Logo;
