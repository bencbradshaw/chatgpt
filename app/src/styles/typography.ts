import { css } from 'lit';

export default css`
  /* Headings */
  h1 {
    font-size: 2.5rem; /* 40px */
    margin: 0.5rem 0; /* Margin for spacing */
    color: var(--heading-color, var(--primary-font-color)); /* Custom heading color */
  }

  h2 {
    font-size: 2rem; /* 32px */
    margin: 0.5rem 0;
    color: var(--heading-color, var(--primary-font-color));
  }

  h3 {
    font-size: 1.75rem; /* 28px */
    margin: 0.5rem 0;
    color: var(--heading-color, var(--primary-font-color));
  }

  h4 {
    font-size: 1.5rem; /* 24px */
    margin: 0.5rem 0;
  }

  h5 {
    font-size: 1.25rem; /* 20px */
    margin: 0.5rem 0;
  }

  h6 {
    font-size: 1rem; /* 16px */
    margin: 0.5rem 0;
    font-weight: bold; /* Optional: bold for h6 */
  }

  /* Paragraphs */
  p {
    margin: 0.5rem 0; /* Margin for spacing */
  }

  /* Lists */
  ul,
  ol {
    margin: 0.5rem 0; /* Margins for lists */
    padding-left: 1.5rem; /* Indentation for lists */
  }

  li {
    margin-bottom: 0.25rem; /* Spacing between list items */
  }

  /* Links */
  a {
    color: var(--color-accent-100);
    text-decoration: underline;
    &:hover {
      color: var(--color-accent-200);
    }
    &:visited {
      color: var(--color-accent-200);
    }
  }

  /* Blockquotes */
  blockquote {
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    border-left: 4px solid var(--color-accent-100);
    background-color: var(--quote-bg-color, #f9f9f9); /* Light background for quotes */
  }

  /* Small Text */
  small {
    font-size: 0.875rem; /* 14px */
    color: var(--secondary-font-color); /* Optional: different color for small text */
  }
`;
