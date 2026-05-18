import { compileWebGLShader, createWebGLContext, createWebGLProgram, setupWebGLBuffers, updateWebGLBuffers, setupWebGLVertexLayout, loadTestTexture, uTexture, uSaturation, uBrightness, uContrast, uTransparency } from "./renderer.js";
import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
import { AddObject, AddObjToGPUArray, deletedObjList, GenerateObj, generateObjectId, GetGPUArray, GetObjArray, GetUIObjArray, GPUObj, imageCache, ObjectType, ObjToGPUObjArray, RemoveObject, renderGPUObjects, ResetObjInGPUArray } from "./objects.js";
import { CreateAndSendImageObject, initInputHandling } from "./input_handling.js";
import { GetPlayerState, HandleObjectModification, HandleUIObjects, ModifyImageTransparency, ModifyPlayerState, PlayerAction } from "./player_state.js";
import { initWebsocketWrapper } from "./communication.js";

let vertexBuffer: WebGLBuffer
let indexBuffer: WebGLBuffer
export let glContext: WebGLRenderingContext
let glProgram: WebGLProgram
export let serverIP: string = "";

export function initGameLoop(serverIP: string)
{
    // Bad, bad solution, but it works, so I'm a happy trooper 
    AddObject(GenerateObj(0, "", ObjectType.Line, [-1.0,-1.0,-1.0,-1.0], [0,0,0,0], null, [0,0,0,0]));

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
// AddObject(GenerateObj(0, "", ObjectType.Line, [-1.0,-1.0,1.0,1.0], [0,0,0,1], null, [1,1,0,1]));
// const tex = loadTestTexture(glContext!, "../arrow.png");
// imageCache.set("rotarr", tex);
// CreateAndSendImageObject("rotarr", 1080, 1080);

function gameLoop()
{
    HandleObjectModification();
    HandleUIObjects();

    const combinedGPUObjectArray = [... GetGPUArray(), ... ObjToGPUObjArray(GetUIObjArray())];
    renderGPUObjects(glContext, glProgram, vertexBuffer, indexBuffer, combinedGPUObjectArray, uTexture!, uSaturation!, uBrightness!, uContrast!, uTransparency!);

    for(const objct of deletedObjList)
    {
        RemoveObject(objct.ObjID);
        let index = GetObjArray().findIndex(obj => obj.ObjID === objct.ObjID);
        if (index !== -1) {
            deletedObjList.splice(index, 1);
            if(GetPlayerState().selectedObject?.ObjID == objct.ObjID)
            {
                ModifyPlayerState({action: PlayerAction.Idle, selectedObject: null});
            }
        }
    }
    requestAnimationFrame(gameLoop);
}