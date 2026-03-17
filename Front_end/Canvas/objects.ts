let objectArray: Obj[];
let gpuObjectArray: GPUObj[];

// Enum for object types
export enum ObjectType
{
    None,
    Rectangle, 
    Line, 
    Circle,
    Brush
}

// Interface for objects which are ready for the GPU to render
export interface GPUObj
{
    UsrID: number,
    ObjID: number,
    Type: ObjectType,
    Vertices: number[],
    Indices: number[],
    Image: WebGLTexture | null
}

// Interface for blueprints of objects, compressed version of GPUObj
export interface Obj
{
    UsrID: number,
    ObjID: number,
    Type: ObjectType,
    Points: number[],
    Color: [number, number, number, number],
    ImageID: number | null
    ExtraArgs: number[]
}

// Used for determining how to update temporary objects (a.k.a. whether to add cursor points to object or modify existing points)
export function IsObjectTypeAppendable(objectType: ObjectType): boolean
{
    if(objectType == ObjectType.Brush)
        return true;

    return false;
}


export function SetObjArray(array: Obj[])
{
    objectArray = array;
}

export function GetObjArray(): Obj[]
{
    return objectArray;
}

export function AddObject(object: Obj)
{
    objectArray.push(object);
}

// Helper function for generating objects
export function GenerateObj(userId: number, objectId: number, type: ObjectType, points: number[],
     color: [number, number, number, number], image: number, extraargs: number[]): Obj
{
    const obj: Obj = {
        UsrID: userId,
        ObjID: objectId,
        Type: type,
        Points: points,
        Color: color,
        ImageID: image,
        ExtraArgs: extraargs
    }

    return obj;
}



export function ConvertToGPUObj(object: Obj): GPUObj | null
{
    if(object.Type == ObjectType.Rectangle) // Rectangle
        return RectangleToGPUObj(object);
    if(object.Type == ObjectType.Line) // Line
        return LineToGPUObj(object);

    return null;
}

// NOTE: Later probably transfer to WASM
// Converts a rectangle object into GPU-ready object
function RectangleToGPUObj(object: Obj): GPUObj
{
    const vertices = 
    [
        object.Points[0], object.Points[1], object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        object.Points[2], object.Points[1], object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        object.Points[2], object.Points[3], object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        object.Points[0], object.Points[3], object.Color[0], object.Color[1], object.Color[2], object.Color[3]
    ];
    const indices = 
    [
        0, 1, 2, 2, 3, 0
    ];

    const obj: GPUObj = {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    }

    return obj;
}

// NOTE: Later probably transfer to WASM
// Converts a line object into GPU-ready object
function LineToGPUObj(object: Obj): GPUObj
{
    // Finding normal line vector and scaling it by thickness
    let dx = object.Points[0] - object.Points[2];
    let dy = object.Points[1] - object.Points[3];
    let dlen = Math.sqrt(dx*dx+dy*dy);
    dx = dx / dlen * object.ExtraArgs[0];
    dy = dy / dlen * object.ExtraArgs[0];

    // Rotating the vector by 90 degrees
    let dxTemp = dx;
    dx = -dy;
    dy = dxTemp;

    const vertices = 
    [
        object.Points[0]+dx, object.Points[1]+dy, object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        object.Points[0]-dx, object.Points[1]-dy, object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        object.Points[2]-dx, object.Points[3]-dy, object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        object.Points[2]+dx, object.Points[3]+dy, object.Color[0], object.Color[1], object.Color[2], object.Color[3]
    ];
    const indices = 
    [
        0, 1, 2, 2, 3, 0
    ];

    const obj: GPUObj = {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    }

    return obj;
}

//
// CONVERTS ARRAY OF OBJECTS TO FINAL VERTEX AND INDEX BUFFERS FOR RENDERING
//
export function bakeObjectsToGPUArrays(objectArray: Obj[]): {vertices: Float32Array, indices: Uint16Array}
{
    let verticesTemporary: number[] = [];
    let indicesTemporary: number[] = [];

    for(let i = 0; i < objectArray.length; i++)
    {
        const newObj = ConvertToGPUObj(objectArray[i])!;
        let currentNumVertices = verticesTemporary.length / 6;
        verticesTemporary = verticesTemporary.concat(newObj.Vertices);
        indicesTemporary = indicesTemporary.concat(newObj.Indices.map(x => currentNumVertices+x));
    }

    let vertices = new Float32Array(verticesTemporary);
    let indices = new Uint16Array(indicesTemporary);

    return {vertices, indices};
}