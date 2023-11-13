import { css } from 'lit';

export const chatGptStyles = css`
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
    height: calc(80vh - 25px);
    max-height: calc(80vh - 25px);
    overflow-y: auto;
    max-width: 100%;
    padding: 0 5%;
  }
  .history {
    width: 800px;
    min-width: 800px;
    max-width: 800px;
    padding: 1rem 2rem;
    box-shadow: rgb(255 255 255) 0px 0px 14px 0px;
    background-color: var(--primary-bg-color);
  }
  .history.user {
    margin-left: 2rem;
    border-radius: 16px 16px 0 16px;
  }
  .history.assistant {
    border-radius: 16px 16px 16px 0;
    margin-right: 2rem;
  }
  img {
    max-width: 100%;
    max-height: 500px;
    margin: 0 auto;
  }
  @media (max-width: 1000px) {
    .history-outer {
      padding: 0 1rem;
    }
    .history {
      width: auto;
      min-width: auto;
      max-width: 100%;
      margin: 0.5rem;
    }
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
    resize: none;
  }
  button {
    margin: 0 10px;
    cursor: pointer;
    background-color: var(--button-bg-color);
    outline: none;
    border: none;
    padding: 0.25rem 1rem;
  }
  button:hover {
    background-color: var(--button-bg-color-hover);
  }
  button:active {
    background-color: var(--button-bg-color);
  }
`;
