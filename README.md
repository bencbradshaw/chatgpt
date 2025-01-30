create .env file

add:

```text
OPEN_AI_SK=your_open_ai_sk
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

- note that the /static dir is not included into the executable, so if placing the executable somewhere, like a server, the static dir needs to be copied over with it, and placed in the same dir as the executable.
