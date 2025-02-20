import { css } from 'lit';

export default css`
  pre code.hljs {
    display: block;
    overflow-x: auto;
    padding: 1em;
    border-radius: 5px;
  }
  code.hljs {
    padding: 3px 5px;
  }

  .hljs {
    background-color: var(--hljs-background-color);
    color: var(--hljs-font-color);
  }
  .hljs-doctag,
  .hljs-keyword,
  .hljs-meta .hljs-keyword,
  .hljs-template-tag,
  .hljs-template-variable,
  .hljs-type,
  .hljs-variable.language_ {
    color: var(--hljs-keyword-color);
  }
  .hljs-title,
  .hljs-title.class_,
  .hljs-title.class_.inherited__,
  .hljs-title.function_ {
    color: var(--hljs-title-color);
  }
  .hljs-attr,
  .hljs-attribute,
  .hljs-literal,
  .hljs-meta,
  .hljs-number,
  .hljs-operator,
  .hljs-selector-attr,
  .hljs-selector-class,
  .hljs-selector-id,
  .hljs-variable {
    color: var(--hljs-attr-color);
  }
  .hljs-regexp,
  .hljs-string,
  .hljs-meta .hljs-string {
    color: var(--hljs-string-color);
  }
  .hljs-comment,
  .hljs-code,
  .hljs-formula {
    color: var(--hljs-comment-color);
  }
  .hljs-name,
  .hljs-quote,
  .hljs-selector-tag,
  .hljs-selector-pseudo {
    color: var(--hjls-color-01);
  }
  .hljs-subst {
    color: var(--hljs-font-color);
  }
  .hljs-section {
    color: var(--hjls-color-02);
    font-weight: bold;
  }
  .hljs-bullet {
    color: var(--hjls-color-03);
  }
  .hljs-emphasis {
    color: var(--hljs-font-color);
    font-style: italic;
  }
  .hljs-strong {
    color: var(--hljs-font-color);
    font-weight: bold;
  }
  .hljs-addition {
    color: var(--hjls-color-04);
    background-color: #f0fff4;
  }
  .hljs-deletion {
    color: var(--hjls-color-05);
    background-color: #ffeef0;
  }
`;
