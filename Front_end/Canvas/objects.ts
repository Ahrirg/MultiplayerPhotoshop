
// Enum for object types
export enum ObjectType
{
    None,
    Rectangle, 
    Line, 
    Brush,
    // New objects
    Ellipse, 
    Star, 
    Triangle, 
    Pentagon, 
    Arrow
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

let objectArray: Obj[] = [GenerateObj(0, 0, ObjectType.Line, [-1.0,-1.0,-1.0,-1.0], [1,0,0,1], 0, [0.0])];


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

export function AppendObjArrayFront(object: Obj)
{
    objectArray.unshift(object);
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
    if(object.Type == ObjectType.Rectangle)
        return RectangleToGPUObj(object);
    if(object.Type == ObjectType.Line)
        return LineToGPUObj(object);
    if(object.Type == ObjectType.Brush)
        return BrushToGPUObj(object);
    if(object.Type == ObjectType.Ellipse)
        return EllipseToGPUObj(object);
    if(object.Type == ObjectType.Triangle)
        return TriangleToGPUObj(object);
    if(object.Type == ObjectType.Star)
        return StarToGPUObj(object);
    if(object.Type == ObjectType.Pentagon)
        return PentagonToGPUObj(object);
    if(object.Type == ObjectType.Arrow)
        return ArrowToGPUObj(object);


    return null;
}

// NOTE: in the future, this method may be optimized to change the number of points 
// it uses to approximate an ellipse given the size of the ellipse as seen on the canvas
// Converts a ellipse object into GPU-ready object
function EllipseToGPUObj(object: Obj): GPUObj {
    const vertices: number[] = [];
    const indices: number[] = [];

    const [x0, y0, x1, y1] = object.Points;

    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const rx = Math.abs(x1 - x0) / 2;
    const ry = Math.abs(y1 - y0) / 2;

    const segments = 60;

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        const x = cx + rx * Math.cos(theta);
        const y = cy + ry * Math.sin(theta);
        vertices.push(x, y, object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
    }

    vertices.push(cx, cy, object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
    for (let i = 1; i <= segments; i++) {
        indices.push(0, i, i + 1);
    }
    indices.push(0, segments, 1);

    const gpuObj: GPUObj = {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    };

    return gpuObj;
}

// Converts an arrow object into GPU-ready object
function ArrowToGPUObj(object: Obj): GPUObj {
    const vertices: number[] = [];
    const indices: number[] = [];

    const [x0, y0, x1, y1] = object.Points;

    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const rx = Math.abs(x1 - x0) / 2;
    const ry = Math.abs(y1 - y0) / 2;

    // hard coded unit arrow used for stretching later
    const unitArrow = [
        0,  1,
        0.6,  0.2,
        0.25, 0.2,
        0.25, -1,
        -0.25, -1,
        -0.25, 0.2,
        -0.6,  0.2
    ];

    // center
    vertices.push(cx, object.Points[3], object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
    const centerIndex = 0;


    for (let i = 0; i < unitArrow.length; i += 2) {
        const x = cx + unitArrow[i] * rx;
        const y = cy + unitArrow[i + 1] * Math.sign(y1-y0) * ry;
        vertices.push(x, y, object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
    }

    for (let i = 1; i <= 7; i++) {
        indices.push(centerIndex, i, i + 1);
    }
    indices[indices.length - 1] = 1;

    const gpuObj: GPUObj = {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    };

    return gpuObj;
}

// Converts a pentagon object into GPU-ready object
// note: you may say ths is just a slightly altered version of the ellipse function. 
// well, you're right. You *could* technically make a single function which takes a 
// hard-coded shape point array which would be more elegant, but this is faster to implement :)
// area for improvement in the future. 
function PentagonToGPUObj(object: Obj): GPUObj
{
    const vertices: number[] = [];
    const indices: number[] = [];

    const [x0, y0, x1, y1] = object.Points;

    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const rx = Math.abs(x1 - x0) / 2;
    const ry = Math.abs(y1 - y0) / 2;

    // hard coded unit pentagon used for stretching later
    const unitPentagon = [
        0, 1,            
        0.951, 0.309,    
        0.588, -0.809,   
        -0.588, -0.809,  
        -0.951, 0.309,   
    ];

    // center
    vertices.push(cx, cy, object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
    const centerIndex = 0;


    for (let i = 0; i < unitPentagon.length; i += 2) {
        const x = cx + unitPentagon[i] * rx;
        const y = cy + unitPentagon[i + 1] * ry;
        vertices.push(x, y, object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
    }

    for (let i = 1; i <= 5; i++) {
        indices.push(centerIndex, i, i + 1);
    }
    indices[indices.length - 1] = 1;

    const gpuObj: GPUObj = {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    };

    return gpuObj;
}

// Converts a star object into GPU-ready object
function StarToGPUObj(object: Obj): GPUObj {
    const vertices: number[] = [];
    const indices: number[] = [];

    const [x0, y0, x1, y1] = object.Points;

    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const rx = Math.abs(x1 - x0) / 2;
    const ry = Math.abs(y1 - y0) / 2;

    // hard coded unit star used for stretching later
    const unitStar = [
        0, 1,            // top
        0.2245, 0.309,   // inner
        0.951, 0.309,    // outer
        0.363, -0.118,   // inner
        0.588, -0.809,   // outer
        0, -0.382,       // inner
        -0.588, -0.809,  // outer
        -0.363, -0.118,  // inner
        -0.951, 0.309,   // outer
        -0.2245, 0.309   // inner
    ];

    // center
    vertices.push(cx, cy, object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
    const centerIndex = 0;


    for (let i = 0; i < unitStar.length; i += 2) {
        const x = cx + unitStar[i] * rx;
        const y = cy + unitStar[i + 1] * ry;
        vertices.push(x, y, object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
    }

    for (let i = 1; i <= 10; i++) {
        indices.push(centerIndex, i, i + 1);
    }
    indices[indices.length - 1] = 1;

    const gpuObj: GPUObj = {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    };

    return gpuObj;
}

// Converts a triangle object into GPU-ready object
function TriangleToGPUObj(object: Obj): GPUObj
{
    const vertices: number[] = 
    [
        object.Points[0], object.Points[1], object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        (object.Points[0] + object.Points[2])/2, object.Points[3], object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        object.Points[2], object.Points[1], object.Color[0], object.Color[1], object.Color[2], object.Color[3],
    ];
    const indices: number[] = [ 0, 1, 2];

    const gpuObj: GPUObj = {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    };

    return gpuObj;
}


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

// Converts a brush object into GPU-ready object
function BrushToGPUObj(object: Obj): GPUObj {
    let vertices: number[] = [];
    let indices: number[] = [];

    function getPerpendicular(dx: number, dy: number): [number, number] {
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.0001) return [0, 0];
        return [(-dy / len) * object.ExtraArgs[0], (dx / len) * object.ExtraArgs[0]];
    }

    for (let i = 0; i < object.Points.length - 2; i += 2) {
        const x = object.Points[i];
        const y = object.Points[i + 1];

        let nx = 0, ny = 0;

        if (i > 0) {
            const dx1 = x - object.Points[i - 2];
            const dy1 = y - object.Points[i - 1];
            const [px1, py1] = getPerpendicular(dx1, dy1);
            nx += px1;
            ny += py1;
        }

        if (i < object.Points.length - 3) {
            const dx2 = object.Points[i + 2] - x;
            const dy2 = object.Points[i + 3] - y;
            const [px2, py2] = getPerpendicular(dx2, dy2);
            nx += px2;
            ny += py2;
        }

        const mlen = Math.sqrt(nx * nx + ny * ny);
        if (mlen > 0.0001) {
            nx = (nx / mlen) * object.ExtraArgs[0];
            ny = (ny / mlen) * object.ExtraArgs[0];
        }

        const idx = vertices.length / 6;
        vertices.push(
            x - nx, y - ny, object.Color[0], object.Color[1], object.Color[2], object.Color[3],
            x + nx, y + ny, object.Color[0], object.Color[1], object.Color[2], object.Color[3]
        );

        if (i > 0) {
            indices.push(
                idx -2, idx - 1, idx,
                idx, idx + 1, idx - 1
            );
        }
    }

    return {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    };
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