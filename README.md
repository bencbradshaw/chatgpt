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
