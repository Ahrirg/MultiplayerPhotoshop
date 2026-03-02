// WASM TEST
Module.onRuntimeInitialized = function() {
    const helloFunc = Module.cwrap('hello', 'string', []);
    let a: number = 6;
    let b: number = 7;
    const result = Module.ccall(
        'mult',
        'number',
        ['number', 'number'],
        [a, b]
    );

    let ptr = helloFunc();
    let helloStr = Module.UTF8ToString(ptr);

    const p = document.createElement("p");
    p.textContent = helloStr;
    document.body.appendChild(p);
    
    console.log("Result from WASM: ", a, "*", b, "=", result);
};



// OPENGL CONTEXT FETCH
const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl') as WebGLRenderingContext;

if (!gl) {
    alert("WebGL not supported");
}


// helper function for compiling shaders
function compileShader(source: string, type: number) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader)!);
    }
    return shader;
}

// VERT SHADER
const vsSource = `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;

    void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
}
`;

// FRAG SHADER
const fsSource = `
    precision mediump float;
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

// SHADER COMPILE
const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

// GPU PROGRAM CREATION
const program = gl.createProgram()!;
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program)!);
}
gl.useProgram(program);

// VERTEX ARRAY DEFINITION
const vertices = new Float32Array([
    0.0,  0.7, 1.0, 0.0, 0.0,
   -0.7, -0.7, 0.0, 1.0, 0.0,
    0.7, -0.7, 0.0, 0.0, 1.0
]);

// GL BUFFER SETUP
const buffer = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);


// ATTRIBUTE SETUP
const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

// POSITION ATTRIB SETUP
const positionLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);

// COLOR ATTRIB SETUP
const colorLocation = gl.getAttribLocation(program, "aColor");
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);


// DRAW CALL
gl.clearColor(0.1, 0.2, 0.3, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);