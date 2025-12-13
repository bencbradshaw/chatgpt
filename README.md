# MyChatGPT

a simple chatgpt web app, built with go and lit

- intended to be simple and easy to use, for local use only
  ![live demo](live-demo.gif)

### features

1. Select model for chat
2. add system message
3. add prompt

- drag and drop files into context
- response streams in live
- copy generated code snippets to clipboard

4. individually delete chat messages from the chat, removing from context no next request
5. switch threads for chat

### stack

- go -> 1 process runs it all. No Node JS. No `npm run dev`
  - esbuild to transpile TS -> JS
  - [framework](https://github.com/bencbradshaw/framework) -> web server + static file server + routing + templating
- lit -> web components with reactive properties
- [go-web-framework](https://github.com/bencbradshaw/framework) - routing, context, live reload on frontend change

### quick start

create .env file

add:

```text
OPEN_AI_SK=your_open_ai_sk
VENICE_AI_SK=your_venice_ai_sk
```

## install go dependencies

```bash
go mod download
```

## install frontend dependencies

```bash
cd frontend
npm install
```

## start in devmode

```bash
make
```

## build

```bash
make build
```

- macos build is in the public folder
- linux build is in the linux folder
