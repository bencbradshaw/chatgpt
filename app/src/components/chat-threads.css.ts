import { css } from 'lit';
import buttonsCss from '../styles/buttons.css.js';

export default [
  [
    buttonsCss,
    css`
      :host {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      section {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        &[upper] {
          padding-top: 1rem;
          .thread {
            box-sizing: border-box;
            border: 1px solid transparent;
            border-radius: 0 5px 5px 0;
            padding: 1rem 0.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            a {
              display: block;
              flex: 1;
              margin: 0;
              padding: 0 0 0 0.25rem;
              font-size: 1rem;
              font-weight: 500;
              user-select: none;
              background-color: transparent;
              color: var(--primary-font-color);
              text-decoration: none;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              border-radius: 4px;
              padding-block: 0.15rem;
              padding-inline: 0.25rem;

              &:hover {
                background-color: var(--button-bg-color-hover);
              }

              &:focus-visible {
                outline: 2px solid rgb(from var(--color-accent-100) r g b / 0.5);
                outline-offset: 2px;
              }

              &[contenteditable='true'] {
                background-color: var(--color-primary-100);
                outline: none;
                border: var(--color-accent-100) solid 1px;
                min-width: 158px;
                padding: 0 2px;
                margin: 0 -2px;
                border-radius: 4px;
                user-select: text;
                cursor: text;
                white-space: normal;
                overflow: visible;
                text-overflow: initial;
              }
            }
            button:not(floating-menu div button) {
              background-color: transparent;
              padding: 2px;
              margin: 0;
              &:hover {
                background-color: var(--color-primary-200);
              }
              &:active,
              &:focus {
                background-color: var(--color-primary-300);
              }
            }
            .menu {
              display: flex;
              flex-direction: column;
              padding: 0.5rem 0.25rem;
              gap: 0.5rem;
              background-color: var(--color-primary-100);
            }
          }
          a.active {
            background-color: var(--button-bg-color);
            color: var(--primary-font-color);
          }
          button.new-thread {
            margin-top: 1rem;
          }
        }
        &[lower] {
          theme-toggle {
            margin: 0 1rem;
          }
        }
      }
    `
  ]
];
