# ChatGPT

A simple ChatGPT web app built with Go and Lit — intended for local use only.  
![live demo](live-demo.gif)

Features

1. Select model for chat
2. Add system messages
3. Add prompts
4. Drag-and-drop files into context
5. Live streaming responses
6. Copy generated code snippets to clipboard
7. Delete individual chat messages (removes from UI context for future requests)
8. Switch chat threads
9. Save and reuse system messages per thread

### Stack

- Go — a single process runs everything. No Node.js. No `npm run dev`.
  - esbuild to transpile TypeScript → JavaScript
  - [framework](https://github.com/bencbradshaw/framework) — web server + static file server + routing + templating
- Lit — web components with reactive properties
- [go-web-framework](https://github.com/bencbradshaw/framework) — routing, context, live reload on frontend changes
- All state is held in the browser IndexedDB

### Quick start

Create a `.env` file and add:

```text
OPEN_AI_SK=your_open_ai_sk
VENICE_AI_SK=your_venice_ai_sk
```

## Install Go dependencies

```bash
go mod download
```

## Install frontend dependencies

```bash
cd frontend
npm install
```

## Start in dev mode

```bash
make
```

## Build

```bash
make build
```

- macOS build is in the `mac` folder
- Linux build is in the `linux` folder
