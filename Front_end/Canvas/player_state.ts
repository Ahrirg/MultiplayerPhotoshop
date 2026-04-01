import {ObjectType, Obj, IsObjectTypeAppendable, GenerateObj, AddObject, GenerateObjectID, ResetObjectBoundingBoxPoints, SetUIObjArray} from "./objects.js"

export enum PlayerAction
{
    Idle, 
    Drawing, 
    Selecting,
    MovingObject,
    RotatingObject
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
    tempObject: Obj | null,
    selectedObject: Obj | null,
    tempObjectIsAppendable: boolean
    brushThickness: number
}

let State: PlayerState =
{
    userID: 0,
    selectedTool: ObjectType.None, 
    selectedColor: [0,0,0,1], 
    action: PlayerAction.Idle,
    mousePosX: 0,
    mousePosY: 0,
    tempObject: null,
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

    if([PlayerAction.Selecting, PlayerAction.MovingObject, PlayerAction.RotatingObject].includes(GetPlayerState().action))
    {
        const sObj = State.selectedObject!;
        // Draw wireframe
        const boundPoints = sObj.BoundingBoxPoints;
        uiObjArray.push(GenerateObj(State.userID, "", ObjectType.UIWireframe, 
        [boundPoints[0], boundPoints[1], boundPoints[2], boundPoints[3]], [0,0,0,1], 0, [0.005])); 

        // Draw rotation icon
        const cx = (boundPoints[0]+boundPoints[2])/2;
        const cy = (boundPoints[1]+boundPoints[3])/2;
        const len = Math.sqrt(Math.pow(boundPoints[0]-boundPoints[2], 2) + Math.pow(boundPoints[1]-boundPoints[3], 2))/ 2 + 0.05;

        uiObjArray.push(GenerateRotationIcon(sObj, boundPoints)); 
    }

    SetUIObjArray(uiObjArray);
}

export function CursorRotationIconCollision(xpos: number, ypos: number): Boolean
{
    const sObj = GetPlayerState().selectedObject!;
    const boundPoints = sObj!.BoundingBoxPoints;
    const tempObj = GenerateRotationIcon(sObj, boundPoints);

    const x0 = tempObj.Points[0] - 0.05;
    const y0 = tempObj.Points[1] - 0.05;
    const x1 = tempObj.Points[0] + 0.05;
    const y1 = tempObj.Points[1] + 0.05;

    if(xpos >= x0 && ypos >= y0 && xpos <= x1 && ypos <= y1)
        return true;

    return false;
}

export function GenerateRotationIcon(sObj: Obj, boundPoints: number[])
{   
    const cx = (boundPoints[0]+boundPoints[2])/2;
    const cy = (boundPoints[1]+boundPoints[3])/2;
    const len = Math.sqrt(Math.pow(boundPoints[0]-boundPoints[2], 2) + Math.pow(boundPoints[1]-boundPoints[3], 2))/ 2 + 0.05;

    return GenerateObj(State.userID, "", ObjectType.UIRotationIcon, 
    [cx + Math.cos(sObj.Angle)*len, cy + Math.sin(sObj.Angle)*len], [0,0,0,0], 0, []); 
}

// TEMPORARY OBJECT RELATED CODE
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
        // Take mouse position

        // Get offset from last mouse position

        // Add offset to every vertex position

        // Update object bounding box

        // Update object pivot point

    }
    // If rotating an object
    else if(State.action == PlayerAction.RotatingObject)
    {
        // Take mouse position
        let newAngle = FindCursorAngleRelativeToObject();

        // Change angle of object
        State.selectedObject!.Angle = newAngle;

        ResetObjectBoundingBoxPoints(State.selectedObject!);
    }
}

export function FindCursorAngleRelativeToObject(): number
{
    const sObj = State.selectedObject!;
    const bounds = sObj.BoundingBoxPoints;

    const cx = (bounds[0] + bounds[2]) / 2;
    const cy = (bounds[1] + bounds[3]) / 2;

    const dx = State.mousePosX - cx;
    const dy = State.mousePosY - cy;

    return Math.atan2(dy, dx);
}

export function GenerateTemporaryObject(): void
{
    State.tempObjectIsAppendable = IsObjectTypeAppendable(State.selectedTool);
    const objectID = GenerateObjectID();
    State.tempObject = GenerateObj(GetPlayerState().userID, "", State.selectedTool, 
            [State.mousePosX, State.mousePosY, State.mousePosX, State.mousePosY], 
            State.selectedColor, 0, [State.brushThickness]);
    AddObject(State.tempObject);
}

export function UpdateTemporaryObject(): void
{
    if(State.tempObjectIsAppendable)
    {
        State.tempObject!.Points.push(State.mousePosX, State.mousePosY);
    }
    else
    {
        State.tempObject!.Points[2] = State.mousePosX;
        State.tempObject!.Points[3] = State.mousePosY;
    }
}