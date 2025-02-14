import { css } from 'lit';

export default css`
  :host {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  :host > * {
    box-sizing: border-box;
  }
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-primary-300);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-primary-400);
    border-radius: 6px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary-500);
    cursor: grab;
  }
  ::-webkit-scrollbar-thumb:active {
    background: var(--color-primary-400);
    cursor: grabbing;
  }
  .history-outer {
    flex-grow: 1;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: flex-start;
    overflow-y: auto;
    max-width: 100%;
  }
  .history {
    width: 800px;
    min-width: 800px;
    max-width: 800px;
    padding: 1rem 2rem;
    background-color: var(--primary-bg-color);
    position: relative;
  }
  @media (max-width: 1150px) {
    .history-outer {
      align-items: stretch;
      padding: 0 20px 0 120px;
    }
    .history {
      width: 100%;
      max-width: 100%;
      min-width: unset;
      margin: 0;
    }
  }
  .history.user {
    margin-left: 2rem;
    border-radius: 20px;
  }
  .history.assistant,
  .history.bot {
    border-radius: 20px;
    margin-right: 2rem;
  }
  img {
    max-width: 100%;
    max-height: 500px;
    margin: 0 auto;
  }

  .mini-preview {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mini-preview img {
    height: 25px;
    max-width: 100%;
    margin: 0px;
    border-radius: 5px;
    overflow: hidden;
  }
  button {
    margin: 10px;
    cursor: pointer;
    background-color: var(--button-bg-color);
    outline: none;
    border: none;
    padding: 0.25rem 1rem;
    width: 115px;
  }
  button:hover {
    background-color: var(--button-bg-color-hover);
  }
  button:active {
    background-color: var(--button-bg-color);
  }
  .button-copy-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    transform: translateY(20px);
  }
  button.copy {
    margin: 0;
    padding: 0;
    width: auto;
  }
  button.delete {
    background-color: transparent;
    color: var(--color-primary-500);
    margin: 0;
    padding: 0;
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    border-radius: 25%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  button.delete:hover {
    background-color: #a01f1f9c;
  }
  pre {
    margin-top: 0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  th,
  td {
    text-align: left;
    padding: 8px;
  }

  th {
    font-weight: bold;
    border-bottom: 1px solid white;
  }

  tr:last-child td {
    border-bottom: 1px solid white;
  }

  tr:nth-child(even) {
    background-color: #353d48;
  }
`;
