---
applyTo: "*.go"
---

Backend conventions for this repo:

- Keep the single-process `net/http` design (see `main.go`). Prefer small, explicit functions over adding layers.
- Streaming endpoints:
	- Keep `Content-Type: text/event-stream` and flush via `http.Flusher` while writing chunks.
	- Treat client disconnects (`Write` error) as a normal stop condition; return without extra noise.
	- For OpenAI Responses streaming, only forward delta chunks (don’t re-send final full text).
- Request/response shapes live in `models/`. Keep handlers thin and focused on I/O.
- Outbound API calls should go through the existing helper (`doPostRequest`) and the shared `httpClient` unless there’s a clear reason not to.
- Error handling:
	- Validate/parse input early; use `respondWithError(w, msg, status)`.
	- Don’t log secrets (API keys) or full user prompts/files; log only minimal operational info.
- Dependencies: strongly prefer stdlib; avoid adding new modules unless absolutely necessary.
- Config: use env vars already in use (`OPEN_AI_SK`, `VENICE_AI_SK`); keep `make run` and `make build` working.