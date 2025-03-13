import { css } from 'lit';

export const buttonsCss = css`
  button {
    outline: none;
    color: var(--primary-font-color);
    cursor: pointer;
    padding: 0.5rem;
    margin: 0px;
    border: none;
    border-radius: 5px;
    background-color: var(--button-bg-color);
    color: var(--primary-font-color);
    box-sizing: border-box;
  }
  button:hover {
    background-color: var(--button-bg-color-hover);
  }
  button:active {
    background-color: var(--button-bg-color);
  }
  .tab {
    background-color: var(--color-primary-100);
    color: var(--primary-font-color);
    outline: none;
    box-sizing: border-box;
    border-radius: 2px;
    border: 2px solid transparent;
  }

  .tab:hover {
    background-color: rgb(from var(--color-accent-100) r g b / 0.9);
    color: var(--color-accent-font-inverse);
  }

  .tab:active {
    background-color: rgb(from var(--color-accent-100) r g b / 0.8);
    color: var(--color-accent-font-inverse);
  }

  .tab:focus {
    background-color: rgb(from var(--color-accent-100) r g b / 0.85);
    border: 2px solid rgb(from var(--color-accent-100) r g b / 0.5);
    color: var(--color-accent-font-inverse);
  }
  .tab.active {
    background-color: rgb(from var(--color-accent-100) r g b / 1.1);
    color: var(--color-accent-font-inverse);
  }
`;
export default buttonsCss;
