export enum ObjectType
{
    None,
    UIWireframe,
    UIRotationIcon, // Points[0] = x position, Points[1] - y position
    Rectangle, 
    Line, // Extraargs[0] contains thickness
    Brush,  // Extraargs[0] contains thickness
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
    ObjID: string,
    Type: ObjectType,
    Vertices: number[],
    Indices: number[],
    Image: WebGLTexture | null
}

// Interface for blueprints of objects, compressed version of GPUObj
export interface Obj
{
    UsrID: number,
    ObjID: string,
    Type: ObjectType,
    Points: number[],
    Color: [number, number, number, number],
    ImageID: number | null,
    BoundingBoxPoints: [number, number, number, number], // (x1,y1,x2,y2)
    Angle: number, 
    PivotPoint: [number, number],
    ExtraArgs: number[]
}

let objectArray: Obj[] = [GenerateObj(0, "", ObjectType.Line, [-1.0,-1.0,-1.0,-1.0], [0,0,0,0], 0, [0.0])];
let uiObjArray: Obj[] = [];

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

export function GetUIObjArray(): Obj[]
{
    return uiObjArray;
}

export function SetUIObjArray(array: Obj[])
{
    uiObjArray = array;
}

export function AddObject(object: Obj)
{
    objectArray.push(object);
}

export function AppendObjArrayFront(object: Obj)
{
    objectArray.unshift(object);
}

export function generateObjectId(): string {
  return Date.now() + "-" + Math.random().toString().substring(2, 10);
}


export function RotateGPUObj(gpuObj: GPUObj, cx: number, cy: number, angle: number)
{
    // for efficiency
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let i = 0; i < gpuObj.Vertices.length; i += 6)
    {
        const x = gpuObj.Vertices[i];
        const y = gpuObj.Vertices[i + 1];

        const dx = x - cx;
        const dy = y - cy;

        gpuObj.Vertices[i]     = cx + dx * cos - dy * sin;
        gpuObj.Vertices[i + 1] = cy + dx * sin + dy * cos;
    }
}

// Helper function for generating objects
export function GenerateObj(userId: number, objectId: string, type: ObjectType, points: number[],
     color: [number, number, number, number], image: number, extraargs: number[]): Obj
{
    const obj: Obj = {
        UsrID: userId,
        ObjID: objectId,
        Type: type,
        Points: points,
        Color: color,
        ImageID: image,
        BoundingBoxPoints: [0,0,0,0], 
        Angle: 0, 
        PivotPoint: [0, 0],
        ExtraArgs: extraargs
    }

    // This part of the project is nearly done, so it would be wasteful to change so much code. 
    // Instead, we will override the objectId parameter and give the obejct a random ID
    obj.ObjID = generateObjectId();

    ResetObjectBoundingBoxPoints(obj);
    const cx = (obj.BoundingBoxPoints[0]+obj.BoundingBoxPoints[2])/2;
    const cy = (obj.BoundingBoxPoints[1]+obj.BoundingBoxPoints[3])/2;

    obj.PivotPoint = [cx, cy];

    return obj;
}

// Finds and sets correct bounding box points for an object 
export function ResetObjectBoundingBoxPoints(object: Obj)
{
    const padding = 0.02;

    const gpuObj = ConvertToGPUObj(object)!;
    RotateGPUObj(gpuObj, 
                object.PivotPoint[0],
                object.PivotPoint[1],
                object.Angle
            )
    const verts = gpuObj.Vertices;

    let minX = verts[0];
    let minY = verts[1];
    let maxX = verts[0];
    let maxY = verts[1];

    for (let i = 6; i < verts.length; i += 6) {
        const x = verts[i];
        const y = verts[i + 1];

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    object.BoundingBoxPoints = [minX - padding, minY - padding, maxX + padding, maxY + padding];
}


export function GenerateObjectID()
{
    // TO IMPLEMENT
    return -1;
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
    if(object.Type == ObjectType.UIWireframe)
        return UIWireframeToGPUObj(object);
    if(object.Type == ObjectType.UIRotationIcon)
        return UIRotationIconToGPUObj(object);

    return null;
}

function UIWireframeToGPUObj(object: Obj): GPUObj {
    const vertices: number[] = [];
    const indices: number[] = [];

    const [x0, y0, x1, y1] = object.Points;

    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    function pushRect(xA: number, yA: number, xB: number, yB: number) {
        const baseLength = vertices.length / 6;

        vertices.push(
            xA, yA, object.Color[0], object.Color[1], object.Color[2], object.Color[3],
            xB, yA, object.Color[0], object.Color[1], object.Color[2], object.Color[3],
            xB, yB, object.Color[0], object.Color[1], object.Color[2], object.Color[3],
            xA, yB, object.Color[0], object.Color[1], object.Color[2], object.Color[3],
        );

        indices.push(
            baseLength, baseLength + 1, baseLength + 2,
            baseLength + 2, baseLength + 3, baseLength
        );
    }

    // Top edge
    pushRect(minX, maxY - object.ExtraArgs[0], maxX, maxY);

    // Bottom edge
    pushRect(minX, minY, maxX, minY + object.ExtraArgs[0]);

    // Left edge
    pushRect(minX, minY, minX + object.ExtraArgs[0], maxY);

    // Right edge
    pushRect(maxX - object.ExtraArgs[0], minY, maxX, maxY);

    return {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        Image: null
    };
}

export function UIRotationIconToGPUObj(object: Obj): GPUObj
{
    // hard-coded icon vertices
    let iconVertices = [0.011588137289060524,-0.03566461936106826,0,0,0,1,0.0031868316514665415,-0.03736434268156221,0,0,0,1,-0.005380973324669226,-0.037111927005737635,0,0,0,1,-0.013667643745468132,-0.034920560053455126,0,0,0,1,-0.021240233884681232,-0.030904732073325593,0,0,0,1,-0.027703105884046744,-0.02527425418043616,0,0,0,1,-0.032718600265229894,-0.018323296556135814,0,0,0,1,-0.03602467730092258,-0.010415019220548445,0,0,0,1,-0.03744860755329652,-0.001962598359110397,0,0,0,1,-0.03691599630337094,0.006592360497538301,0,0,0,1,-0.03445467038058369,0.014802894614410034,0,0,0,1,-0.030193224321107184,0.0222400360857464,0,0,0,1,-0.024354301812381886,0.02851522371000116,0,0,0,1,-0.017242963441794747,0.033300603774480284,0,0,0,1,-0.009230748488587223,0.036346159114003296,0,0,0,1,-0.000736263467273561,0.037492771518077436,0,0,0,1,0.007796688405665969,0.03668053502751771,0,0,0,1,0.01592229417302675,0.03395188578367332,0,0,0,1,0.023216023099118785,0.029449384908027926,0,0,0,1,0.02929680672017844,0.02340827024793818,0,0,0,1,0.03384694816311977,0.01614416613031107,0,0,0,1,0.036628720549532715,0.008036593239939417,0,0,0,1,0.037496787284025265,-0.000490859833925418,0,0,0,1,0.036405795316009806,-0.008992667424563137,0,0,0,1,0.0334127446570638,-0.017024643740233006,0,0,0,1,0.006952882373436317,-0.021398771616640958,0,0,0,1,0.0019120989908799207,-0.022418605608937325,0,0,0,1,-0.00322858399480154,-0.022267156203442582,0,0,0,1,-0.008200586247280879,-0.02095233603207308,0,0,0,1,-0.012744140330808743,-0.018542839243995357,0,0,0,1,-0.01662186353042805,-0.015164552508261694,0,0,0,1,-0.019631160159137934,-0.010993977933681488,0,0,0,1,-0.021614806380553547,-0.0062490115323290685,0,0,0,1,-0.022469164531977913,-0.001177559015466241,0,0,0,1,-0.022149597782022565,0.0039554162985229804,0,0,0,1,-0.02067280222835021,0.008881736768646016,0,0,0,1,-0.018115934592664307,0.013344021651447838,0,0,0,1,-0.014612581087429133,0.017109134226000702,0,0,0,1,-0.010345778065076847,0.019980362264688162,0,0,0,1,-0.005538449093152334,0.021807695468401986,0,0,0,1,-0.0004417580803641394,0.022495662910846467,0,0,0,1,0.004678013043399584,0.022008321016510637,0,0,0,1,0.009553376503816054,0.020371131470203988,0,0,0,1,0.013929613859471265,0.017669630944816758,0,0,0,1,0.01757808403210706,0.014044962148762899,0,0,0,1,0.02030816889787186,0.00968649967818664,0,0,0,1,0.021977232329719626,0.004821955943963646,0,0,0,1,0.022498072370415165,-0.0002945159003552508,0,0,0,1,0.021843477189605887,-0.005395600454737887,0,0,0,1,0.020047646794238275,-0.010214786244139802,0,0,0,1,0.03875878380219401,-0.019748586738670287,0,0,0,1,0.014701607649108064,-0.007490843245702525,0,0,0,1,0.021511430349024266,-0.020910723668469192,0,0,0,1];
    const iconIndices = [0,1,26,0,26,25,1,2,27,1,27,26,2,3,28,2,28,27,3,4,29,3,29,28,4,5,30,4,30,29,5,6,31,5,31,30,6,7,32,6,32,31,7,8,33,7,33,32,8,9,34,8,34,33,9,10,35,9,35,34,10,11,36,10,36,35,11,12,37,11,37,36,12,13,38,12,38,37,13,14,39,13,39,38,14,15,40,14,40,39,15,16,41,15,41,40,16,17,42,16,42,41,17,18,43,17,43,42,18,19,44,18,44,43,19,20,45,19,45,44,20,21,46,20,46,45,21,22,47,21,47,46,22,23,48,22,48,47,23,24,49,23,49,48,50,51,52];

    for(let i = 0; i < iconVertices.length; i+=6)
    {
        iconVertices[i] += object.Points[0];
        iconVertices[i+1] += object.Points[1];
    }

    return {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: iconVertices,
        Indices: iconIndices,
        Type: object.Type,
        Image: null
    };
}

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
        const object = objectArray[i];
        let newObj = ConvertToGPUObj(object)!;
        // rotating object
        if(object.Angle != 0)
        {
            RotateGPUObj(newObj,
                object.PivotPoint[0],
                object.PivotPoint[1],
                object.Angle
            )
        }

        let currentNumVertices = verticesTemporary.length / 6;
        verticesTemporary = verticesTemporary.concat(newObj.Vertices);
        indicesTemporary = indicesTemporary.concat(newObj.Indices.map(x => currentNumVertices+x));
    }

    let vertices = new Float32Array(verticesTemporary);
    let indices = new Uint16Array(indicesTemporary);

    return {vertices, indices};
}

// Finds the most recently created object which the cursor is in the bounds of
export function CursorObjectCollision(xpos: number, ypos: number)
{
    for(let i = objectArray.length - 1; i >= 0; i--)
    {

        const obj = objectArray[i];

        if ( xpos >= obj.BoundingBoxPoints[0] && xpos <= obj.BoundingBoxPoints[2] &&
            ypos >= obj.BoundingBoxPoints[1] && ypos <= obj.BoundingBoxPoints[3]) 
        {
            return obj;
        }
    }

    return null;
}