import {ObjectType, Obj, IsObjectTypeAppendable, GenerateObj, AddObject, SetUIObjArray, CalculateObjGeometricProperties, generateObjectId, padding, handleSize, GenerateCorrectBoundingBox} from "./objects.js"

const UIboundary = 0.95


export enum PlayerAction
{
    Idle, 
    Drawing, 
    Selecting,
    MovingObject,
    RotatingObject,
    ScalingObject
    // modifying? moving?
}

interface PlayerState 
{
    userID: number,
    selectedTool: ObjectType, 
    selectedColor: [number, number, number, number], 
    action: PlayerAction
    mousePosX: number,
    mousePosY: number,
    lastFrameMousePos: [number, number]
    howScaleBeLikeWhenWeStartYoooo: 1, 
    tempObject: Obj | null,
    scalingRectIndex: number,
    lastRecordedMousePos: [number, number],
    selectedObject: Obj | null,
    tempObjectIsAppendable: boolean
    brushThickness: number
}

let State: PlayerState =
{
    userID: 0,
    selectedTool: ObjectType.Brush, 
    selectedColor: [0,0,0,1], 
    action: PlayerAction.Idle,
    mousePosX: 0,
    mousePosY: 0,
    lastFrameMousePos: [0,0],
    howScaleBeLikeWhenWeStartYoooo: 1, 
    tempObject: null,
    scalingRectIndex: -1,
    lastRecordedMousePos: [0,0],
    selectedObject: null,
    tempObjectIsAppendable: false,
    brushThickness: 0.01
};

export function ModifyPlayerState(changes: Object)
{
    Object.assign(State, changes);
}

export function GetPlayerState()
{
    return State;
}

export function HandleUIObjects(): void
{
    let uiObjArray = [];

    if([PlayerAction.Selecting, PlayerAction.MovingObject, PlayerAction.RotatingObject, PlayerAction.ScalingObject].includes(GetPlayerState().action))
    {
        const sObj = State.selectedObject!;
        // Draw wireframe
        const boundPoints = GenerateCorrectBoundingBox(sObj).Points
        uiObjArray.push(GenerateCorrectBoundingBox(sObj)!);

        // Draw rotation icon
        const len = Math.sqrt(Math.pow(boundPoints[0]-boundPoints[2], 2) + Math.pow(boundPoints[1]-boundPoints[3], 2))/ 2 + 0.05;
        let rotationIconObj = GenerateObj(State.userID, "", ObjectType.UIRotationIcon, 
            [Math.min(Math.max(sObj.PivotPoint[0] + Math.cos(sObj.Angle)*len, -UIboundary), UIboundary), Math.min(Math.max(sObj.PivotPoint[1] + Math.sin(sObj.Angle)*len, -UIboundary), UIboundary)],
             [0,0,0,0], 0, []); 

        uiObjArray.push(rotationIconObj);
    }

    SetUIObjArray(uiObjArray);
}

export function CursorWireframeCollision(object: Obj): Boolean
{
    let simulatedWireframe = GenerateCorrectBoundingBox(object)!

    let state = GetPlayerState()
    let xpos = state.mousePosX
    let ypos = state.mousePosY
    const [bx1, by1, bx2, by2] = simulatedWireframe.Points

    if ( xpos >= bx1 && xpos <= bx2 &&
        ypos >= by1 && ypos <= by2) 
        return true

    return false;
}

function GetWireframeRects(object: Obj) {
    const [x0, y0, x1, y1] = object.Points;

    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    const half = handleSize / 2;

    return {
        corners: [
            [minX - half, minY - half, minX + half, minY + half],
            [maxX - half, minY - half, maxX + half, minY + half],
            [maxX - half, maxY - half, maxX + half, maxY + half],
            [minX - half, maxY - half, minX + half, maxY + half],
        ]
    };
}

export function CursorScalingRectangleCollision(object: Obj): number
{
    const wireframe = GenerateCorrectBoundingBox(object);
    const pts = wireframe.Points;

    const state = GetPlayerState();
    const xpos = state.mousePosX;
    const ypos = state.mousePosY;

    const half = handleSize / 2;

    function hit(xA: number, yA: number, xB: number, yB: number) {
        return xpos >= xA && xpos <= xB && ypos >= yA && ypos <= yB;
    }

    // Extract min/max properly (same result, clearer)
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < pts.length; i += 2)
    {
        const x = pts[i];
        const y = pts[i + 1];

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;

        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    // Bottom-left
    if (hit(minX - half, minY - half, minX + half, minY + half)) return 0;

    // Bottom-right
    if (hit(maxX - half, minY - half, maxX + half, minY + half)) return 1;

    // Top-right
    if (hit(maxX - half, maxY - half, maxX + half, maxY + half)) return 2;

    // Top-left
    if (hit(minX - half, maxY - half, minX + half, maxY + half)) return 3;

    return -1;
}

export function CursorRotationIconCollision(): Boolean
{
    let xpos = State.mousePosX
    let ypos = State.mousePosY
    const sObj = GetPlayerState().selectedObject!;
    const tempObj = GenerateRotationIcon(sObj);

    const x0 = tempObj.Points[0] - 0.05;
    const y0 = tempObj.Points[1] - 0.05;
    const x1 = tempObj.Points[0] + 0.05;
    const y1 = tempObj.Points[1] + 0.05;

    if(xpos >= x0 && ypos >= y0 && xpos <= x1 && ypos <= y1)
        return true;

    return false;
}

export function GenerateRotationIcon(sObj: Obj)
{   
    const boundPoints = GenerateCorrectBoundingBox(sObj).Points
    const len = Math.sqrt(Math.pow(boundPoints[0]-boundPoints[2], 2) + Math.pow(boundPoints[1]-boundPoints[3], 2))/ 2 + 0.05;
    return GenerateObj(State.userID, "", ObjectType.UIRotationIcon, 
    [Math.min(Math.max(sObj.PivotPoint[0] + Math.cos(sObj.Angle)*len, -UIboundary), UIboundary), Math.min(Math.max(sObj.PivotPoint[1] + Math.sin(sObj.Angle)*len, -UIboundary))], [0,0,0,0], 0, []); 
}

export function RotatePoints(points: number[], angle: number){

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const out: number[] = [];

    for (let i = 0; i < points.length; i += 2) {
        let x = points[i];
        let y = points[i + 1];

        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;

        out.push(rx, ry);
    }

    return out;
}

export function RotateVector(x: number, y: number, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

export function HandleObjectModification(): void
{
    // If drawing, update points of currently drawn object
    if(State.action == PlayerAction.Drawing)
    {
        if(GetPlayerState().tempObject == null)
            return;
        
        // Add (modify) points of temporary object
        UpdateTemporaryObject();
    }
    // If moving an object
    else if(State.action == PlayerAction.MovingObject)
    {
        let dx = State.mousePosX - State.lastFrameMousePos[0]
        let dy = State.mousePosY - State.lastFrameMousePos[1]

        State.selectedObject!.PivotPoint[0] += dx;
        State.selectedObject!.PivotPoint[1] += dy;

        State.lastFrameMousePos = [State.mousePosX, State.mousePosY]
    }
    else if(State.action == PlayerAction.RotatingObject)
    {
        let newAngle = FindCursorAngleRelativeToObject();
        State.selectedObject!.Angle = newAngle;
    }
    else if (State.action == PlayerAction.ScalingObject)
    {
        const obj = State.selectedObject!;

        const sx = State.lastRecordedMousePos[0] - obj.PivotPoint[0];
        const sy = State.lastRecordedMousePos[1] - obj.PivotPoint[1];

        const ex = State.mousePosX - obj.PivotPoint[0];
        const ey = State.mousePosY - obj.PivotPoint[1];

        const startDist = Math.sqrt(sx * sx + sy * sy);
        const endDist = Math.sqrt(ex * ex + ey * ey);

        if (startDist < 0.00001) return;

        const scaleRatio = endDist / startDist;

        obj.Scale = State.howScaleBeLikeWhenWeStartYoooo * scaleRatio;

        State.lastFrameMousePos = [State.mousePosX, State.mousePosY];
    }

}

export function FindCursorAngleRelativeToObject(): number
{
    const sObj = State.selectedObject!;
    const dx = State.mousePosX - sObj.PivotPoint[0];
    const dy = State.mousePosY - sObj.PivotPoint[1];
    return Math.atan2(dy, dx);
}

export function GenerateTemporaryObject(): void
{
    State.tempObjectIsAppendable = IsObjectTypeAppendable(State.selectedTool);
    State.tempObject = GenerateObj(GetPlayerState().userID, "", State.selectedTool, 
            [State.mousePosX, State.mousePosY, State.mousePosX, State.mousePosY], 
            State.selectedColor, 0, [State.brushThickness]);
    AddObject(State.tempObject);
}

export function UpdateTemporaryObject(): void
{
    const tempObj = State.tempObject!;

    if(State.tempObjectIsAppendable)
    {
        tempObj.Points.push(State.mousePosX, State.mousePosY);
    }
    else
    {
        tempObj.Points[2] = State.mousePosX;
        tempObj.Points[3] = State.mousePosY;
    }
}