interface EmscriptenModule {
    // Wraps C++ function to js function
    cwrap(
        ident: string,
        returnType: 'number' | 'string' | 'void' | null,
        argTypes: Array<'number' | 'string'>
    ): (...args: any[]) => number | string | void;

    // Calls C++ function
    ccall(
        ident: string, 
        returnType: 'number' | 'string' | 'void' | null, 
        argTypes: Array<'number' | 'string'>, 
        args: any[]
    ): number | string | void;


    // Converts pointer in WASM linear memory to js string
    UTF8ToString(ptr: number | string | void): string;

    onRuntimeInitialized?: () => void;
}

declare var Module: EmscriptenModule;