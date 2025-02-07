import { css } from "lit";

export const buttonsCss = css`
button {
      outline: none;
      color: var(--primary-font-color);
      cursor: pointer;
      padding: 0.5rem;
      margin: 0 10px;
      border: none;
      border-radius: 5px;
      background-color: var(--button-bg-color);
      color: var(--primary-font-color);
    }
    button:hover {
      background-color: var(--button-bg-color-hover);
    }
    button:active {
      background-color: var(--button-bg-color);
    }
    `;