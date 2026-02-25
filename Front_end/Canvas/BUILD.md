=================
CANVAS BUILD DOC
=================

## PREREQUISITES:
1. Emscripten, a C/C++ - WASM compiler: 
https://emscripten.org/docs/getting_started/downloads.html
2. Python 3 for local server


## COMPILE: 
emcc test.cpp -O3 -s EXPORTED_FUNCTIONS="['_add','_hello']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap', 'UTF8ToString']" -o test.js


## LOCALLY HOST PY SERVER TO TEST:
python -m http.server 8000

