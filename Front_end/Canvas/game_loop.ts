import { compileWebGLShader, createWebGLContext, createWebGLProgram, renderWebGLCanvas, setupWebGLBuffers, updateWebGLBuffers, setupWebGLVertexLayout } from "./renderer.js";
import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
import { Obj, ObjectType, GenerateObj, bakeObjectsToGPUArrays, SetObjArray, GetObjArray } from "./objects.js";
import { initInputHandling } from "./input_handling.js";
import { GetPlayerState, HandleTemporaryObjects } from "./player_state.js";

// Object array setup
SetObjArray([]);

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