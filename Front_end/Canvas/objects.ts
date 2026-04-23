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
    Arrow,
    Image
}

// Interface for objects which are ready for the GPU to render
export interface GPUObj
{
    UsrID: number,
    ObjID: string,
    Type: ObjectType,
    Vertices: number[],
    Indices: number[],
    ImageId: string | null
    ExtraArgs: number[] // Currently for images only. 0 - contrast, 1 - saturation, 2 - brightness
}

// Interface for blueprints of objects, compressed version of GPUObj
export interface Obj
{
    UsrID: number,
    ObjID: string,
    Type: ObjectType,
    Points: number[],
    Color: [number, number, number, number],
    ImageId: string | null,
    Scale: number
    Angle: number, 
    PivotPoint: [number, number],
    ExtraArgs: number[]
}

let objectArray: Obj[] = []//[GenerateObj(0, "", ObjectType.Line, [-1.0,-1.0,-1.0,-1.0], [0,0,0,0], 0, [0.0])];
let uiObjArray: Obj[] = [];
let gpuObjArray: GPUObj[] = [];
export const imageCache = new Map<string, WebGLTexture | null>();
export const padding = 0.00;
export const wireframeThickness = 0.01;
export const handleSize = 0.05;
const VERTEX_STRIDE = 9;

function pushVertex(
    vertices: number[],
    x: number,
    y: number,
    color: number[],
    u = 0,
    v = 0,
    useTexture = 0
) {
    vertices.push(
        x, y,
        color[0], color[1], color[2], color[3],
        u, v,
        useTexture
    );
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

export function GetUIObjArray(): Obj[]
{
    return uiObjArray;
}

export function GetGPUArray(): GPUObj[]
{
    return gpuObjArray;
}

export function SetUIObjArray(array: Obj[])
{
    uiObjArray = array;
}

export function AddObject(object: Obj)
{
    objectArray.push(object);
    AddObjToGPUArray(object);
}

export function AppendObjArrayFront(object: Obj)
{
    objectArray.unshift(object);
}

export function AddObjToGPUArray(object: Obj)
{
    const objCopy = structuredClone(object);
    // 1. Scale
    ScaleObject(objCopy);
    // 1.5. Convert to GPUObj
    let newObj = ConvertToGPUObj(objCopy)!;
    // 2. Rotate
    if(objCopy.Angle != 0)
    {
        RotateGPUObj(newObj, [0,0], objCopy.Angle);
    }
    // 3. Translate
    for(let i = 0; i < newObj.Vertices.length; i+=VERTEX_STRIDE)
    {
        newObj.Vertices[i] += objCopy.PivotPoint[0];
        newObj.Vertices[i+1] += objCopy.PivotPoint[1];
    }

    gpuObjArray.push(newObj);
}

export function ObjToGPUObjArray(array: Obj[]): GPUObj[]
{
    let gpuArr: GPUObj[] = []
    for(let i = 0; i < array.length; i++)
    {
        const objCopy = structuredClone(array[i]);
        // 1. Scale
        ScaleObject(objCopy);
        // 1.5. Convert to GPUObj
        let newObj = ConvertToGPUObj(objCopy)!;
        // 2. Rotate
        if(objCopy.Angle != 0)
        {
            RotateGPUObj(newObj, [0,0], objCopy.Angle);
        }
        // 3. Translate
        for(let i = 0; i < newObj.Vertices.length; i+=VERTEX_STRIDE)
        {
            newObj.Vertices[i] += objCopy.PivotPoint[0];
            newObj.Vertices[i+1] += objCopy.PivotPoint[1];
        }
        gpuArr.push(newObj);
    }
    return gpuArr;
}

// Assumes the object has already been modified in ObjArray
export function ResetObjInGPUArray(ID: string)
{    
    const objIndex = objectArray.findIndex(obj => obj.ObjID === ID);

    const objCopy = structuredClone(objectArray[objIndex]);
    // 1. Scale
    ScaleObject(objCopy);
    // 1.5. Convert to GPUObj
    let newObj = ConvertToGPUObj(objCopy)!;
    // 2. Rotate
    if(objCopy.Angle != 0)
    {
        RotateGPUObj(newObj, [0,0], objCopy.Angle);
    }
    // 3. Translate
    for(let i = 0; i < newObj.Vertices.length; i+=VERTEX_STRIDE)
    {
        newObj.Vertices[i] += objCopy.PivotPoint[0];
        newObj.Vertices[i+1] += objCopy.PivotPoint[1];
    }

    // 4. Reset object in GPU array
    const gpuIndex = gpuObjArray.findIndex(obj => obj.ObjID === ID);

    if (gpuIndex !== -1) {
        gpuObjArray[gpuIndex] = newObj;
    }

}

export function generateObjectId(): string {
  return Date.now() + "-" + Math.random().toString().substring(2, 10);
}

export function RotateGPUObj(gpuObj: GPUObj, pivotPoint: [number, number], angle: number)
{
    const cx = pivotPoint[0];
    const cy = pivotPoint[1];

    // for efficiency
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let i = 0; i < gpuObj.Vertices.length; i += VERTEX_STRIDE)
    {
        const x = gpuObj.Vertices[i];
        const y = gpuObj.Vertices[i + 1];

        const dx = x - cx;
        const dy = y - cy;

        gpuObj.Vertices[i]     = cx + dx * cos - dy * sin;
        gpuObj.Vertices[i + 1] = cy + dx * sin + dy * cos;
    }
}

export function RotateObj(obj: Obj)
{
    const angle = obj.Angle
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let i = 0; i < obj.Points.length; i += 2)
    {
        const x = obj.Points[i];
        const y = obj.Points[i + 1];

        obj.Points[i]     = x * cos - y * sin;
        obj.Points[i + 1] = x * sin + y * cos;
    }
}

// Helper function for generating objects
export function GenerateObj(userId: number, objectId: string, type: ObjectType, points: number[],
     color: [number, number, number, number], imageId: string | null, extraargs: number[]): Obj
{
    const obj: Obj = {
        UsrID: userId,
        ObjID: objectId,
        Type: type,
        Points: points,
        Color: color,
        ImageId: imageId,
        Scale: 1, 
        Angle: 0, 
        PivotPoint: [0, 0],
        ExtraArgs: extraargs
    }

    obj.ObjID = generateObjectId();


    return obj;
}

export function GenerateCorrectBoundingBox(object: Obj)
{
    let tempObj = structuredClone(object);
    // 1. Scale
    ScaleObject(tempObj)
    // 1.5. Convert to GPUObj
    let newObj = ConvertToGPUObj(tempObj)!;
    // 2. Rotate
    if(tempObj.Angle != 0)
    {
        RotateGPUObj(newObj, [0,0], tempObj.Angle)
    }
    // 3. Translate
    for(let i = 0; i < newObj.Vertices.length; i+=VERTEX_STRIDE)
    {
        newObj.Vertices[i] += object.PivotPoint[0];
        newObj.Vertices[i+1] += object.PivotPoint[1];
    }
    let vertices = newObj.Vertices


    let minX = vertices[0];
    let minY = vertices[1];
    let maxX = vertices[0];
    let maxY = vertices[1];

    for (let i = VERTEX_STRIDE; i < vertices.length; i += VERTEX_STRIDE)
    {
        const x = vertices[i];
        const y = vertices[i + 1];

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }
    let BoundingBox = []

    BoundingBox[0] = minX - padding;
    BoundingBox[1] = minY - padding;
    BoundingBox[2] = maxX + padding;
    BoundingBox[3] = maxY + padding;

    return GenerateObj(-1, "", ObjectType.UIWireframe, BoundingBox, [0,0,0,1], null, []); 
}

export function ScaleObject(object: Obj)
{
    const points = object.Points;
    const scale = object.Scale;
    for (let i = 0; i < points.length; i += 2) {
        points[i] *= scale;
        points[i + 1] *= scale;
    }
}

export function CalculateObjGeometricProperties(object: Obj)
{
    let objCopy = structuredClone(object)
    let points = objCopy.Points;

    let minX = points[0];
    let minY = points[1];
    let maxX = points[0];
    let maxY = points[1];

    for (let i = 2; i < points.length; i += 2)
    {
        const x = points[i];
        const y = points[i + 1];

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    object.PivotPoint[0] = (minX+maxX)/2
    object.PivotPoint[1] = (minY+maxY)/2

    for (let i = 0; i < points.length; i += 2)
    {
        object.Points[i] -= object.PivotPoint[0];
        object.Points[i + 1] -= object.PivotPoint[1];
    }
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
    if(object.Type == ObjectType.Image)
        return ImageToGPUObj(object);

    return null;
}

function ImageToGPUObj(object: Obj): GPUObj {
    let vertices: number[] = []

    pushVertex(vertices, object.Points[0], object.Points[1], [1,1,1,1], 0, 0, 1);
    pushVertex(vertices, object.Points[2], object.Points[3], [1,1,1,1], 1, 0, 1);
    pushVertex(vertices, object.Points[4], object.Points[5], [1,1,1,1], 1, 1, 1);
    pushVertex(vertices, object.Points[6], object.Points[7], [1,1,1,1], 0, 1, 1);

    return {
    UsrID: object.UsrID,
    ObjID: object.ObjID,
    Type: ObjectType.Image,
    ImageId: object.ImageId,
    Vertices: vertices,
    Indices: [
        0, 1, 2,
        2, 3, 0
    ],
    ExtraArgs: object.ExtraArgs
    };

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
        const baseIndex = vertices.length / VERTEX_STRIDE;

        pushVertex(vertices, xA, yA, object.Color);
        pushVertex(vertices, xB, yA, object.Color);
        pushVertex(vertices, xB, yB, object.Color);
        pushVertex(vertices, xA, yB, object.Color);

        indices.push(
            baseIndex, baseIndex + 1, baseIndex + 2,
            baseIndex + 2, baseIndex + 3, baseIndex
        );
    }


    pushRect(minX, maxY - wireframeThickness, maxX, maxY);
    pushRect(minX, minY, maxX, minY + wireframeThickness);
    pushRect(minX, minY, minX + wireframeThickness, maxY);
    pushRect(maxX - wireframeThickness, minY, maxX, maxY);

    const half = handleSize / 2;
    pushRect(
        minX - half,
        minY - half,
        minX + half,
        minY + half
    );
    pushRect(
        maxX - half,
        minY - half,
        maxX + half,
        minY + half
    );
    pushRect(
        minX - half,
        maxY - half,
        minX + half,
        maxY + half
    );
    pushRect(
        maxX - half,
        maxY - half,
        maxX + half,
        maxY + half
    );

    return {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        ImageId: null,
        ExtraArgs: [1,1,0]
    };
}

export function UIRotationIconToGPUObj(object: Obj): GPUObj
{
    // hard-coded icon vertices
    let iconVertices = [0.011588137289060524,-0.03566461936106826,0.0031868316514665415,-0.03736434268156221,-0.005380973324669226,-0.037111927005737635,-0.013667643745468132,-0.034920560053455126,-0.021240233884681232,-0.030904732073325593,-0.027703105884046744,-0.02527425418043616,-0.032718600265229894,-0.018323296556135814,-0.03602467730092258,-0.010415019220548445,-0.03744860755329652,-0.001962598359110397,-0.03691599630337094,0.006592360497538301,-0.03445467038058369,0.014802894614410034,-0.030193224321107184,0.0222400360857464,-0.024354301812381886,0.02851522371000116,-0.017242963441794747,0.033300603774480284,-0.009230748488587223,0.036346159114003296,-0.000736263467273561,0.037492771518077436,0.007796688405665969,0.03668053502751771,0.01592229417302675,0.03395188578367332,0.023216023099118785,0.029449384908027926,0.02929680672017844,0.02340827024793818,0.03384694816311977,0.01614416613031107,0.036628720549532715,0.008036593239939417,0.037496787284025265,-0.000490859833925418,0.036405795316009806,-0.008992667424563137,0.0334127446570638,-0.017024643740233006,0.006952882373436317,-0.021398771616640958,0.0019120989908799207,-0.022418605608937325,-0.00322858399480154,-0.022267156203442582 ,-0.008200586247280879,-0.02095233603207308 ,-0.012744140330808743,-0.018542839243995357 ,-0.01662186353042805,-0.015164552508261694 ,-0.019631160159137934,-0.010993977933681488 ,-0.021614806380553547,-0.0062490115323290685 ,-0.022469164531977913,-0.001177559015466241 ,-0.022149597782022565,0.0039554162985229804 ,-0.02067280222835021,0.008881736768646016 ,-0.018115934592664307,0.013344021651447838 ,-0.014612581087429133,0.017109134226000702 ,-0.010345778065076847,0.019980362264688162 ,-0.005538449093152334,0.021807695468401986 ,-0.0004417580803641394,0.022495662910846467 ,0.004678013043399584,0.022008321016510637 ,0.009553376503816054,0.020371131470203988 ,0.013929613859471265,0.017669630944816758 ,0.01757808403210706,0.014044962148762899 ,0.02030816889787186,0.00968649967818664 ,0.021977232329719626,0.004821955943963646 ,0.022498072370415165,-0.0002945159003552508 ,0.021843477189605887,-0.005395600454737887 ,0.020047646794238275,-0.010214786244139802 ,0.03875878380219401,-0.019748586738670287 ,0.014701607649108064,-0.007490843245702525 ,0.021511430349024266,-0.020910723668469192 ];
    const iconIndices = [0,1,26,0,26,25,1,2,27,1,27,26,2,3,28,2,28,27,3,4,29,3,29,28,4,5,30,4,30,29,5,6,31,5,31,30,6,7,32,6,32,31,7,8,33,7,33,32,8,9,34,8,34,33,9,10,35,9,35,34,10,11,36,10,36,35,11,12,37,11,37,36,12,13,38,12,38,37,13,14,39,13,39,38,14,15,40,14,40,39,15,16,41,15,41,40,16,17,42,16,42,41,17,18,43,17,43,42,18,19,44,18,44,43,19,20,45,19,45,44,20,21,46,20,46,45,21,22,47,21,47,46,22,23,48,22,48,47,23,24,49,23,49,48,50,51,52];

    let vertices: number[] = []

    for(let i = 0; i < iconVertices.length; i+=2)
    {
        let x =iconVertices[i] + object.Points[0];
        let y = iconVertices[i+1] + object.Points[1];
        pushVertex(vertices, x, y, [0,0,0,1]);
    }

    return {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: iconIndices,
        Type: object.Type,
        ImageId: null,
        ExtraArgs: [1,1,0]
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
        pushVertex(vertices, x, y, object.Color);
    }

    pushVertex(vertices, cx, cy, object.Color);
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
        ImageId: null,
        ExtraArgs: [1,1,0]
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
    pushVertex(vertices, cx, object.Points[3], object.Color);
    const centerIndex = 0;


    for (let i = 0; i < unitArrow.length; i += 2) {
        const x = cx + unitArrow[i] * rx;
        const y = cy + unitArrow[i + 1] * Math.sign(y1-y0) * ry;
        vertices.push(x, y, object.Color[0], object.Color[1], object.Color[2], object.Color[3]);
        pushVertex(vertices, x, y, object.Color);
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
        ImageId: null,
        ExtraArgs: [1,1,0]

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
    pushVertex(vertices, cx, cy, object.Color);
    const centerIndex = 0;


    for (let i = 0; i < unitPentagon.length; i += 2) {
        const x = cx + unitPentagon[i] * rx;
        const y = cy + unitPentagon[i + 1] * ry;
        pushVertex(vertices, x, y, object.Color);
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
        ImageId: null,
        ExtraArgs: [1,1,0]

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
    pushVertex(vertices, cx, cy, object.Color);
    const centerIndex = 0;


    for (let i = 0; i < unitStar.length; i += 2) {
        const x = cx + unitStar[i] * rx;
        const y = cy + unitStar[i + 1] * ry;
        pushVertex(vertices, x, y, object.Color);
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
        ImageId: null,
        ExtraArgs: [1,1,0]

    };

    return gpuObj;
}

// Converts a triangle object into GPU-ready object
function TriangleToGPUObj(object: Obj): GPUObj
{
    const vertices: number[] = []

    pushVertex(vertices, object.Points[0], object.Points[1], object.Color);
    pushVertex(vertices, (object.Points[0] + object.Points[2])/2, object.Points[3], object.Color);
    pushVertex(vertices, object.Points[2], object.Points[1], object.Color);

    const indices: number[] = [ 0, 1, 2];

    const gpuObj: GPUObj = {
        UsrID: object.UsrID,
        ObjID: object.ObjID,
        Vertices: vertices,
        Indices: indices,
        Type: object.Type,
        ImageId: null,
        ExtraArgs: [1,1,0]

    };

    return gpuObj;
}


// Converts a rectangle object into GPU-ready object
function RectangleToGPUObj(object: Obj): GPUObj
{
    const vertices: number[] = []

    pushVertex(vertices, object.Points[0], object.Points[1], object.Color);
    pushVertex(vertices, object.Points[2], object.Points[1], object.Color);
    pushVertex(vertices, object.Points[2], object.Points[3], object.Color);
    pushVertex(vertices, object.Points[0], object.Points[3], object.Color);

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
        ImageId: null,
        ExtraArgs: [1,1,0]

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

    const vertices: number[] = []

    pushVertex(vertices, object.Points[0]+dx, object.Points[1]+dy, object.Color);
    pushVertex(vertices, object.Points[0]-dx, object.Points[1]-dy, object.Color);
    pushVertex(vertices, object.Points[2]-dx, object.Points[3]-dy, object.Color);
    pushVertex(vertices, object.Points[2]+dx, object.Points[3]+dy, object.Color);


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
        ImageId: null,
        ExtraArgs: [1,1,0]

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

        const idx = vertices.length / VERTEX_STRIDE;
        pushVertex(vertices, x - nx, y - ny, object.Color);
        pushVertex(vertices, x + nx, y + ny, object.Color);

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
        ImageId: null,
        ExtraArgs: [1,1,0]

    };
}

// Finds the most recently created object which the cursor is in the bounds of
export function CursorObjectCollision(xpos: number, ypos: number)
{
    for(let i = objectArray.length - 1; i >= 0; i--)
    {
        const obj = objectArray[i];
        let BoundingBoxPoints = GenerateCorrectBoundingBox(obj).Points


        if ( xpos >= BoundingBoxPoints[0] && xpos <= BoundingBoxPoints[2] &&
            ypos >= BoundingBoxPoints[1] && ypos <= BoundingBoxPoints[3]) 
        {
            return obj;
        }
    }

    return null;
}

//
// CONVERTS ARRAY OF OBJECTS TO FINAL VERTEX AND INDEX BUFFERS FOR RENDERING
//
export function renderGPUObjects(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    vertexBuffer: WebGLBuffer,
    indexBuffer: WebGLBuffer,
    gpuObjects: GPUObj[],
    uTexture: WebGLUniformLocation,
    uSaturation: WebGLUniformLocation,
    uBrightness: WebGLUniformLocation,
    uContrast: WebGLUniformLocation,
) {
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);

    gl.uniform1i(uTexture, 0);

    for (const obj of gpuObjects) {
        gl.uniform1f(uContrast, obj.ExtraArgs[0]);
        gl.uniform1f(uSaturation, obj.ExtraArgs[1]);
        gl.uniform1f(uBrightness, obj.ExtraArgs[2]);
        // Bind texture if exists
        if (obj.ImageId) {
            const texture = imageCache.get(obj.ImageId);

            if(texture)
            {
                gl.bindTexture(gl.TEXTURE_2D, texture!);
            }
            else
            {
                // console.log("Could not find image in set of images (OR its falsy).")
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(obj.Vertices),
            gl.STATIC_DRAW
        );

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(obj.Indices),
            gl.STATIC_DRAW
        );

        gl.drawElements(
            gl.TRIANGLES,
            obj.Indices.length,
            gl.UNSIGNED_SHORT,
            0
        );
    }
}