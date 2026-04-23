import { compileWebGLShader, createWebGLContext, createWebGLProgram, setupWebGLBuffers, updateWebGLBuffers, setupWebGLVertexLayout, loadTestTexture, uTexture, uSaturation, uBrightness, uContrast } from "./renderer.js";
import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
import { AddObject, AddObjToGPUArray, GenerateObj, generateObjectId, GetGPUArray, GetObjArray, GetUIObjArray, GPUObj, imageCache, ObjectType, ObjToGPUObjArray, renderGPUObjects, ResetObjInGPUArray } from "./objects.js";
import { CreateAndSendImageObject, initInputHandling } from "./input_handling.js";
import { GetPlayerState, HandleObjectModification, HandleUIObjects } from "./player_state.js";
import { initWebsocketWrapper } from "./communication.js";

let vertexBuffer: WebGLBuffer
let indexBuffer: WebGLBuffer
export let glContext: WebGLRenderingContext
let glProgram: WebGLProgram
export let serverIP: string = "";

export function initGameLoop(serverIP: string)
{
    serverIP = serverIP;
    initWebsocketWrapper(serverIP);
    let vertices: number[] = []
    let indices: number[] = []

    // WebGL renderer initialization
    glContext = createWebGLContext('glCanvas');


    const vertexShader = compileWebGLShader(glContext, vertexShaderSource, glContext.VERTEX_SHADER);
    const fragmentShader = compileWebGLShader(glContext, fragmentShaderSource, glContext.FRAGMENT_SHADER);

    glProgram = createWebGLProgram(glContext, fragmentShader, vertexShader);


    const buffers = setupWebGLBuffers(glContext, new Float32Array(vertices), new Uint16Array(indices));
    vertexBuffer = buffers.vertexBuffer;
    indexBuffer = buffers.indexBuffer;

    setupWebGLVertexLayout(glContext, glProgram);

    // User input handling initialization
    initInputHandling('glCanvas');
    requestAnimationFrame(gameLoop)
}

// initGameLoop("");
// const tex = loadTestTexture(glContext!, "../rs7.jpg");
// imageCache.set("uWu", tex);
// CreateAndSendImageObject("uWu", 1920, 1080);

// Render/game loop
function gameLoop()
{
    // console.log("NUMBER OF IMAGES IN CACHE = " + imageCache.size)
    /// Handling temporary object (object being created by user, or the selected object)
    HandleObjectModification();
    HandleUIObjects();

    // Combining canvas objects with canvas UI elements
    const combinedGPUObjectArray = [... GetGPUArray(), ... ObjToGPUObjArray(GetUIObjArray())];
    renderGPUObjects(glContext, glProgram, vertexBuffer, indexBuffer, combinedGPUObjectArray, uTexture!, uSaturation!, uBrightness!, uContrast!);

    /// Requesting next frame
    requestAnimationFrame(gameLoop);
}