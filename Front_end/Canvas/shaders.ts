//
//  File for storing WebGL shaders. 
//  Currently consisting of just two shaders, so naming might change in the future. 
//

export const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec4 a_color;
    attribute vec2 a_uv;
    attribute float a_useTexture;

    varying vec4 v_color;
    varying vec2 v_uv;
    varying float v_useTexture;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_color = a_color;
        v_uv = vec2(a_uv.x, 1.0 - a_uv.y);
        v_useTexture = a_useTexture;
    }
`;

export const fragmentShaderSource = `
    precision highp float;

    varying vec4 v_color;
    varying vec2 v_uv;
    varying float v_useTexture;

    uniform sampler2D u_texture;

    uniform float u_contrast;     // 1.0 = normal
    uniform float u_saturation;   // 1.0 = normal
    uniform float u_brightness;   // 0.0 = normal

    void main() {
        vec4 texColor = texture2D(u_texture, v_uv);
        texColor.rgb = (texColor.rgb - 0.5) * u_contrast + 0.5;
        texColor.rgb += u_brightness;

        float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        vec3 gray = vec3(luminance);

        texColor.rgb = mix(gray, texColor.rgb, u_saturation);
        texColor.rgb = clamp(texColor.rgb, 0.0, 1.0);

        gl_FragColor = mix(v_color, texColor, v_useTexture);
    }
`;