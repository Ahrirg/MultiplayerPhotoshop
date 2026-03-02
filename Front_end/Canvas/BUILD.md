=================
CANVAS BUILD DOC
For compiling web assembly and typescript files, and testing on a local server
=================

## Prerequisites

1. **Make** — GNU Make (Windows: mingw32-make or Git for Windows)
2. **Emscripten** — installed and `emcc` available in PATH
3. **TypeScript** — installed globally (`npm install -g typescript`)
4. **Python 3** — for running the local HTTP server (`python -m http.server`)


## Project Structure

- `test.cpp` → C++ code compiled to WASM
- `app.ts` → TypeScript frontend
- `dist/` → output folder for compiled JS/WASM files


## Build
```bash
make
```

## Run
```bash
make run
```
