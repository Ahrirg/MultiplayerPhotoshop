import { compileWebGLShader, createWebGLContext, createWebGLProgram, renderWebGLCanvas, setupWebGLBuffers, updateWebGLBuffers, setupWebGLVertexLayout } from "./renderer.js";
import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
import { Obj, ObjectType, GenerateObj, bakeObjectsToGPUArrays, SetObjArray, GetObjArray } from "./objects.js";
import { initInputHandling } from "./input_handling.js";
import { GetPlayerState, HandleTemporaryObjects } from "./player_state.js";

// Object setup
SetObjArray([
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
]);

let {vertices, indices} = bakeObjectsToGPUArrays(GetObjArray());


// WebGL renderer initialization
const glContext = createWebGLContext('glCanvas');

const vertexShader = compileWebGLShader(glContext, vertexShaderSource, glContext.VERTEX_SHADER);
const fragmentShader = compileWebGLShader(glContext, fragmentShaderSource, glContext.FRAGMENT_SHADER);

const glProgram = createWebGLProgram(glContext, fragmentShader, vertexShader);


const buffers = setupWebGLBuffers(glContext, vertices, indices);
let vertexBuffer = buffers.vertexBuffer;
let indexBuffer = buffers.indexBuffer;

setupWebGLVertexLayout(glContext, glProgram);

// User input handling initialization
initInputHandling('glCanvas');


// Render/game loop
function gameLoop()
{
    /// Handling updates from server
    // PLACEHOLDER

    /// Handling temporary object (object being created by user, or the selected object)
    HandleTemporaryObjects();

    /// Converting objects into render-ready arrays of vertices and indices
    let {vertices, indices} = bakeObjectsToGPUArrays(GetObjArray());

    /// Updating vertex and index buffers inside GPU
    updateWebGLBuffers(glContext, vertexBuffer, indexBuffer, vertices, indices);

    /// Rendering vertex buffer using index buffer, onto the canvas
    renderWebGLCanvas(glContext, indices);

    /// Requesting next frame
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop)