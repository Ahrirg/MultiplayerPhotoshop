//
//  File for storing WebGL shaders. 
//  Currently consisting of just two shaders, so naming might change in the future. 
//

// VERTEX SHADER
export const vertexShaderSource = `
    attribute vec2 aPosition;
    attribute vec4 v_color;
    varying vec4 color;

    void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    color = v_color;
}
`;

// FRAGMENT SHADER
export const fragmentShaderSource = `
    precision mediump float;
    varying vec4 color;

    void main() {
        gl_FragColor = vec4(color);
    }
`;