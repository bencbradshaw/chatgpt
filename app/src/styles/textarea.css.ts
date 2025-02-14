import { css } from 'lit';

export const textareaCss = css`
  textarea {
    background-color: var(--chatbox-bg-color);
    color: var(--primary-font-color);
    border: none;
    padding: 1rem;
    border-radius: 20px;
    resize: none;
    min-height: 1rem;
    max-height: 1rem;
    overflow: hidden;
    margin: 0 10px;
    font-family: 'Arial', sans-serif;
    font-size: 1rem;
    line-height: 1rem;
    background-color: var(--color-primary-300);
    &:disabled {
      cursor: not-allowed;
    }
    &:focus {
      outline: none;
    }
  }
`;
