OUT = dist

# Windows cmd fallback
ifeq ($(OS),Windows_NT)
    MKDIR = if not exist $(OUT) mkdir $(OUT)
else
    MKDIR = mkdir -p $(OUT)
endif


all: $(OUT)/app.js

run: all
	cmd /c start "http://localhost:8000"
	cd $(OUT) && start "" python -m http.server 8000

clean:
ifeq ($(OS),Windows_NT)
	del "$(OUT)\app.js"
	del "$(OUT)\test.js"
	del "$(OUT)\test.wasm"
else
	rm -f $(OUT)/app.js $(OUT)/test.js $(OUT)/test.wasm
endif


$(OUT)/app.js: app.ts $(OUT)/test.wasm
	$(MKDIR)
	tsc app.ts --outFile $(OUT)/app.js

$(OUT)/test.js: test.cpp
	$(MKDIR)
	emcc test.cpp -O3 -s EXPORTED_FUNCTIONS="['_mult', '_hello']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','UTF8ToString','getValue','setValue','HEAP32']" -o $(OUT)/test.js