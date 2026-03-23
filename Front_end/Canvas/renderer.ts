//
//  Typescript file responsible for WebGL abstractions
//
//
//


//
//  FUNCTION FOR GENERATING WEBGL CONTEXT
//
export function createWebGLContext(canvasID: string): WebGLRenderingContext
{
    const canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;

    if (!gl) {
        alert("WebGL not supported");
    }
    return gl;
}

//
// HELPER FUNCTION FOR COMPILING SHADERS
//
export function compileWebGLShader(gl: WebGLRenderingContext, source: string, type: number) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader)!);
    }
    return shader;
}

//
// SELF EXPLANATORY, I JUST LIKE WRITING COMMENTS
//
export function createWebGLProgram(gl: WebGLRenderingContext, fragShader: WebGLShader, vertShader: WebGLShader): WebGLProgram
{
    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program)!);
    }
    gl.useProgram(program);

    return program;
}

//
// GL BUFFER SETUP
//
// NOTE: SET TO DYAMIC DRAW LATER
export function setupWebGLBuffers(gl: WebGLRenderingContext, vertices: Float32Array, indices: Uint16Array): {vertexBuffer: WebGLBuffer, indexBuffer: WebGLBuffer}
{
    const vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return {vertexBuffer, indexBuffer};
}

//
// Function for updating WebGL buffers after they have been created
//
export function updateWebGLBuffers(gl: WebGLRenderingContext, vertexBuffer: WebGLBuffer, indexBuffer: WebGLBuffer, vertices: Float32Array, indices: Uint16Array)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

//
//  FUNCTION FOR SETTING UP VERTEX ATTRIBUTES
//
export function setupWebGLVertexLayout(gl: WebGLRenderingContext, program: WebGLProgram)
{
    // SIZE OF EACH VERTEX IN BYTES
    const stride = 6 * Float32Array.BYTES_PER_ELEMENT;

    // POSITION ATTRIB SETUP
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);

    // COLOR ATTRIB SETUP
    const colorLocation = gl.getAttribLocation(program, "v_color");
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
}

//
// DRAW CALL FUNCTION
//
export function renderWebGLCanvas(gl: WebGLRenderingContext, indices: Uint16Array)
{
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}
