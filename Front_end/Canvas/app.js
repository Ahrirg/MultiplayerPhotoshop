// WASM TEST
Module.onRuntimeInitialized = function () {
    var helloFunc = Module.cwrap('hello', 'string', []);
    var a = 6;
    var b = 7;
    var result = Module.ccall('mult', 'number', ['number', 'number'], [a, b]);
    var ptr = helloFunc();
    var helloStr = Module.UTF8ToString(ptr);
    var p = document.createElement("p");
    p.textContent = helloStr;
    document.body.appendChild(p);
    console.log("Result from WASM: ", a, "*", b, "=", result);
};
// OPENGL CONTEXT FETCH
var canvas = document.getElementById('glCanvas');
var gl = canvas.getContext('webgl');
if (!gl) {
    alert("WebGL not supported");
}
// helper function for compiling shaders
function compileShader(source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}
// VERT SHADER
var vsSource = "\n    attribute vec2 aPosition;\n    attribute vec3 aColor;\n    varying vec3 vColor;\n\n    void main() {\n    gl_Position = vec4(aPosition, 0.0, 1.0);\n    vColor = aColor;\n}\n";
// FRAG SHADER
var fsSource = "\n    precision mediump float;\n    varying vec3 vColor;\n\n    void main() {\n        gl_FragColor = vec4(vColor, 1.0);\n    }\n";
// SHADER COMPILE
var vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);
// GPU PROGRAM CREATION
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);
// VERTEX ARRAY DEFINITION
var vertices = new Float32Array([
    0.0, 0.7, 1.0, 0.0, 0.0,
    -0.7, -0.7, 0.0, 1.0, 0.0,
    0.7, -0.7, 0.0, 0.0, 1.0
]);
// GL BUFFER SETUP
var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
// ATTRIBUTE SETUP
var stride = 5 * Float32Array.BYTES_PER_ELEMENT;
// POSITION ATTRIB SETUP
var positionLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
// COLOR ATTRIB SETUP
var colorLocation = gl.getAttribLocation(program, "aColor");
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
// DRAW CALL
gl.clearColor(0.1, 0.2, 0.3, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);
