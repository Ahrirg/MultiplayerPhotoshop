OUT = dist

# Windows cmd fallback
ifeq ($(OS),Windows_NT)
    MKDIR = if not exist $(OUT) mkdir $(OUT)
else
    MKDIR = mkdir -p $(OUT)
endif


all: $(OUT)/game_loop.js

run: all
	cmd /c start "http://localhost:8000"
	python -m http.server 8000

clean:
ifeq ($(OS),Windows_NT)
	del "$(OUT)\test.js"
	del "$(OUT)\test.wasm"
	del "$(OUT)\objects.js"
	del "$(OUT)\shaders.js"
	del "$(OUT)\renderer.js"
	del "$(OUT)\game_loop.js"
	del "$(OUT)\input_handling.js"
	del "$(OUT)\player_state.js"
else
# Wait, why don't I just rm -f *  ???
	rm -f $(OUT)/test.js $(OUT)/test.wasm "$(OUT)\types.js" "$(OUT)\shaders.js" "$(OUT)\renderer.js" "$(OUT)\game_loop.js" "$(OUT)\input_handling.js" "$(OUT)\player_state.js"
endif


$(OUT)/game_loop.js: game_loop.ts objects.ts renderer.ts shaders.ts input_handling.ts player_state.ts
	$(MKDIR)
	tsc

$(OUT)/test.js $(OUT)/test.wasm: test.c
	$(MKDIR)
	emcc test.c -O3 -s EXPORTED_FUNCTIONS="['_mult', '_hello']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','UTF8ToString','getValue','setValue','HEAP32']" -o $(OUT)/test.js