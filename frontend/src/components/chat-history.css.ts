import { css } from 'lit';

export default css`
  :host {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 25px);
  }
  :host > * {
    box-sizing: border-box;
  }
  .history-outer {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: flex-start;
    height: calc(80vh - 50px);
    max-height: calc(80vh - 50px);
    overflow-y: auto;
    max-width: 100%;
    padding: 0 5% 0 120px;
  }
  .history {
    width: 800px;
    min-width: 800px;
    max-width: 800px;
    padding: 1rem 2rem;
    box-shadow: rgb(255 255 255) 0px 0px 14px 0px;
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
    border-radius: 16px 16px 0 16px;
  }
  .history.assistant,
  .history.bot {
    border-radius: 16px 16px 16px 0;
    margin-right: 2rem;
  }
  img {
    max-width: 100%;
    max-height: 500px;
    margin: 0 auto;
  }

  .inputs-outer {
    width: 100vw;
    max-width: 100vw;
    height: 20vh;
    max-height: 20vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .inputs-inner {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0.5rem;
  }

  textarea {
    background-color: var(--chatbox-bg-color);
    color: white;
    border: 1px solid #474747; /* a slightly contrasting border color */
    padding: 1rem;
    border-radius: 5px;
    min-height: calc(4rem + 12px);
    max-height: calc(20vh - 2rem);
    margin: 0 10px;
    min-width: 400px;
    max-width: 800px;
    font-family: 'Arial', sans-serif;
    font-size: 1rem;
  }
  textarea:disabled {
    cursor: not-allowed;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
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
    transform: translateY(16px);
  }
  button.copy {
    margin: 0;
    padding: 0;
    width: auto;
  }
  button.delete {
    background-color: #424040;
    margin: 0;
    padding: 0 0 4px 0;
    position: absolute;
    top: 8px;
    right: 8px;
    width: 16px;
    height: 16px;
    border-radius: 25%;
  }
  button.delete:hover {
    background-color: #a01f1f;
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
