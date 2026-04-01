import { compileWebGLShader, createWebGLContext, createWebGLProgram, renderWebGLCanvas, setupWebGLBuffers, updateWebGLBuffers, setupWebGLVertexLayout } from "./renderer.js";
import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
import { bakeObjectsToGPUArrays, GetObjArray, GetUIObjArray } from "./objects.js";
import { initInputHandling } from "./input_handling.js";
import { HandleObjectModification, HandleUIObjects } from "./player_state.js";

let vertexBuffer: WebGLBuffer
let indexBuffer: WebGLBuffer
let glContext: WebGLRenderingContext
export let serverIP: string = "";

export function initGameLoop(serverIP: string)
{
    serverIP = serverIP;
    let {vertices, indices} = bakeObjectsToGPUArrays(GetObjArray());

    // WebGL renderer initialization
    glContext = createWebGLContext('glCanvas');


    const vertexShader = compileWebGLShader(glContext, vertexShaderSource, glContext.VERTEX_SHADER);
    const fragmentShader = compileWebGLShader(glContext, fragmentShaderSource, glContext.FRAGMENT_SHADER);

    const glProgram = createWebGLProgram(glContext, fragmentShader, vertexShader);


    const buffers = setupWebGLBuffers(glContext, vertices, indices);
    vertexBuffer = buffers.vertexBuffer;
    indexBuffer = buffers.indexBuffer;

    setupWebGLVertexLayout(glContext, glProgram);

    // User input handling initialization
    initInputHandling('glCanvas');
    requestAnimationFrame(gameLoop)
}

//initGameLoop("");
 
// FOR TESTING
// setTimeout(() => {
//   handleServerMessage(new MessageEvent('message', {
//     data: JSON.stringify({
//       type: "createObject",
//       obj: GenerateObj(0, "", ObjectType.Arrow, [-0.5,-0.5,-0.6,0.3], [0,0,0,1], 0, [0.0])
//     })}))
// }, 5000);
console.log("game loop speaking. The server IP is: " + serverIP);
// Render/game loop
function gameLoop()
{
    /// Handling temporary object (object being created by user, or the selected object)
    HandleObjectModification();
    HandleUIObjects();

    // Combining canvas objects with canvas UI elements
    const combinedObjectArray = [... GetObjArray(), ... GetUIObjArray()];
    /// Converting objects into render-ready arrays of vertices and indices
    let {vertices, indices} = bakeObjectsToGPUArrays(combinedObjectArray);

    /// Updating vertex and index buffers inside GPU
    updateWebGLBuffers(glContext, vertexBuffer, indexBuffer, vertices, indices);

    /// Rendering vertex buffer using index buffer, onto the canvas
    renderWebGLCanvas(glContext, indices);

    /// Requesting next frame
    requestAnimationFrame(gameLoop);
}