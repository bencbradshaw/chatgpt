---
applyTo: "app/*"
---

Frontend conventions for this repo:

- Use Lit web components (extend `LitElement`) and keep components small and focused.
- TypeScript:
	- Keep strict typing (explicit types for events/handlers and public properties).
	- Use ESM imports with `.js` extensions (even when importing from `.ts`).
- State:
	- Use `go-web-framework/state-store.js` (`StateStore` + `@prop()`) for shared app state.
	- Use `@lit/context` (`provide`/`consume`) to share the store instance.
	- Prefer store methods for side-effects (network/IDB) and keep components mostly rendering + event wiring.
- Network:
	- Use the existing `ApiService` for API calls; avoid adding new fetch helpers.
	- Streaming responses are consumed as async iterables (`TextEventStream`).
- Styles:
	- Prefer component-scoped styles via `static styles`.
	- When styles are reused, place them in `app/src/styles/*.css.ts` and import.
	- Avoid adding new style systems or dependencies.
- Build/dev:
	- Frontend entry is `app/src/index.ts` and is bundled by Go/esbuild (`make run`, `make build`).