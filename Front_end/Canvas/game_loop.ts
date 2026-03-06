import { compileWebGLShader, createWebGLContext, createWebGLProgram, renderWebGLCanvas, setupWebGLBuffers, updateWebGLBuffers, setupWebGLVertexLayout } from "./renderer.js";
import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
import { Obj, ObjectType, GenerateObj, bakeObjectsToGPUArrays } from "./types.js";

// Object setup
const objectArray: Obj[] = [
    GenerateObj(0, 2, ObjectType.Line, [0.0,0.0,-0.5,-0.8], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 3, ObjectType.Line, [0.0,0.0,0.5,-0.8], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 4, ObjectType.Line, [0.0,0.0,0.0,0.5], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 5, ObjectType.Line, [0.0,0.5,-0.5,0.0], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 5, ObjectType.Line, [0.0,0.5,0.5,0.0], [0,0,0,1], 0, [0.01]),
    GenerateObj(0, 6, ObjectType.Rectangle, [-0.2,0.5,0.2,0.8], [0,0,0,1], 0, []),
    GenerateObj(0, 7, ObjectType.Line, [0.5,-0.5,0.5,0.95], [1,0.5,0.3,1], 0, [0.02]),
    GenerateObj(0, 8, ObjectType.Rectangle, [0.5,0.5,1,0.65], [1,0,0,1], 0, []),
    GenerateObj(0, 9, ObjectType.Rectangle, [0.5,0.65,1,0.8], [0,0.7,0,1], 0, []),
    GenerateObj(0, 10, ObjectType.Rectangle, [0.5,0.8,1,0.95], [1,1,0,1], 0, [])
]


let {vertices, indices} = bakeObjectsToGPUArrays(objectArray);


// WebGL renderer initialization
const glContext = createWebGLContext('glCanvas');

const vertexShader = compileWebGLShader(glContext, vertexShaderSource, glContext.VERTEX_SHADER);
const fragmentShader = compileWebGLShader(glContext, fragmentShaderSource, glContext.FRAGMENT_SHADER);

const glProgram = createWebGLProgram(glContext, fragmentShader, vertexShader);


const buffers = setupWebGLBuffers(glContext, vertices, indices);
let vertexBuffer = buffers.vertexBuffer;
let indexBuffer = buffers.indexBuffer;

setupWebGLVertexLayout(glContext, glProgram);


// Render/game loop
function gameLoop()
{
    // Handling updates from server
    // PLACEHOLDER

    // Handling user input
    // PLACEHOLDER

    // Handling temporary object (object being created by user, or the selected object)
    // PLACEHOLDER

    // Modifying objects (as a test, remove later)
    objectArray[8].Color[0] += 0.01;
    objectArray[0].Points[0] += 0.02;

    // Converting objects into render-ready arrays of vertices and indices
    let {vertices, indices} = bakeObjectsToGPUArrays(objectArray);
    // Updating vertex and index buffers inside GPU
    updateWebGLBuffers(glContext, vertexBuffer, indexBuffer, vertices, indices);
    // Rendering vertex buffer using index buffer, onto the canvas
    renderWebGLCanvas(glContext, indices);

    // Requesting next frame
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop)