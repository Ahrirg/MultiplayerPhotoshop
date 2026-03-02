#include <emscripten/emscripten.h>

extern "C" {

EMSCRIPTEN_KEEPALIVE
int mult(int a, int b) {
    return a * b;
}

EMSCRIPTEN_KEEPALIVE
char* hello() {
    return (char*)"Hello, WASM!\n";
}

}