import { css } from 'lit';

export default css`
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
`;
