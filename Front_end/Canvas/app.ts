import {GenerateObj, ObjectType, Obj, ConvertToGPUObj} from "./objects.js";

//
// WASM TEST
//
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

//
// WEBGL
//

// VERTEX AND INDEX ARRAY SETUP
let verticesTemporary: number[] = [];
let indicesTemporary: number[] = [];

// Rectangle list
const arr: Obj[] = [
    GenerateObj(0, 2, ObjectType.Line, [-0.0,0.0,-0.5,-0.8], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 3, ObjectType.Line, [0.0,0.0,0.5,-0.8], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 4, ObjectType.Line, [0.0,0.0,0.0,0.5], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 5, ObjectType.Line, [0.0,0.5,-0.5,0.0], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 5, ObjectType.Line, [0.0,0.5,0.5,0.0], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 6, ObjectType.Rectangle, [-0.2,0.5,0.2,0.8], [0,0,0,1], 0, []),
    GenerateObj(0, 7, ObjectType.Line, [0.5,-0.5,0.5,0.95], [1,0.5,0.3,1], 0, [0.02]),
    GenerateObj(0, 8, ObjectType.Rectangle, [0.5,0.5,1,0.65], [1,0,0,1], 0, []),
    GenerateObj(0, 9, ObjectType.Rectangle, [0.5,0.65,1,0.8], [0,0.7,0,1], 0, []),
    GenerateObj(0, 10, ObjectType.Rectangle, [0.5,0.8,1,0.95], [1,1,0,1], 0, []),
    // Drawing "Lithuanian patriot" by Gustas Šadbaras
]
for(let i = 0; i < arr.length; i++)
{
    const newObj = ConvertToGPUObj(arr[i])!;
    let currentNumVertices = verticesTemporary.length / 6;
    verticesTemporary = verticesTemporary.concat(newObj.Vertices);
    indicesTemporary = indicesTemporary.concat(newObj.Indices.map(x => currentNumVertices+x));
}

const vertices = new Float32Array(verticesTemporary);
const indices = new Uint16Array(indicesTemporary);



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

// OPENGL CONTEXT CREATION
const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl') as WebGLRenderingContext;

if (!gl) {
    alert("WebGL not supported");
}

// VERT SHADER
const vsSource = `
    attribute vec2 aPosition;
    attribute vec4 v_color;
    varying vec4 color;

    void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    color = v_color;
}
`;

// FRAG SHADER
const fsSource = `
    precision mediump float;
    varying vec4 color;

    void main() {
        gl_FragColor = vec4(color);
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


// GL BUFFER SETUP
const vertexBuffer = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer()!;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


// ATTRIBUTE SETUP
const stride = 6 * Float32Array.BYTES_PER_ELEMENT;

// POSITION ATTRIB SETUP
const positionLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);

// COLOR ATTRIB SETUP
const colorLocation = gl.getAttribLocation(program, "v_color");
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);


// DRAW CALL
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
