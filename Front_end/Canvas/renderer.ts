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

export function useImageShader(gl: WebGLRenderingContext)
{
    
}

export function setupWebGLVertexLayout(
    gl: WebGLRenderingContext,
    program: WebGLProgram
)
{
    const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

    // 9 floats per vertex:
    // position (2) + color (4) + uv (2) + useTexture (1)
    const stride = 9 * FLOAT_SIZE;

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(
        positionLocation,
        2,                  // vec2
        gl.FLOAT,
        false,
        stride,
        0                   // offset
    );

    const colorLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(
        colorLocation,
        4,                  // vec4
        gl.FLOAT,
        false,
        stride,
        2 * FLOAT_SIZE      // after position
    );

    const uvLocation = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(
        uvLocation,
        2,
        gl.FLOAT,
        false,
        stride,
        6 * FLOAT_SIZE
    );

    const useTextureLocation = gl.getAttribLocation(program, "a_useTexture");
    gl.enableVertexAttribArray(useTextureLocation);
    gl.vertexAttribPointer(
        useTextureLocation,
        1,
        gl.FLOAT,
        false,
        stride,
        8 * FLOAT_SIZE
    );
}

export function createTextureFromBitmap(gl: WebGLRenderingContext, bitmap: ImageBitmap): WebGLTexture {
    const texture = gl.createTexture();
    if (!texture) {
        throw new Error("Failed to create WebGL texture");
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        bitmap
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
}

export function loadTestTexture(gl: WebGLRenderingContext, url: string): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 255, 255]) // magenta debug pixel :3
    );

    const image = new Image();
    image.src = url;


    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );

        gl.generateMipmap(gl.TEXTURE_2D);
    };

    return texture!;
}