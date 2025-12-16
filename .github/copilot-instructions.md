
# Copilot instructions (repo-wide)

This repo is a local-only ChatGPT web app.

Architecture: a single Go process serves HTML/templates/static and exposes `POST /api/chat` for streaming. Frontend is a Lit (web components) app built from `app/src/index.ts` using esbuild via `github.com/bencbradshaw/framework`.

Project layout:
- Go entrypoint: `main.go`
- HTTP handlers: `handlers/`
- Request/response structs: `models/`
- Frontend: `app/` (TypeScript, ESM)

When changing code:
- Follow existing patterns and keep changes small and production-ready.
- Avoid new dependencies unless absolutely necessary.
- Prefer simple, explicit code over abstraction.

Build/run commands (keep these working):
- Dev: `make run` (or `make`)
- Build: `make build`

