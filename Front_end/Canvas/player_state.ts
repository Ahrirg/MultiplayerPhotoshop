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
        // Draw wireframe and rotation icon
        const boundPoints = GetPlayerState().selectedObject?.BoundingBoxPoints!;
        uiObjArray.push(GenerateObj(GetPlayerState().userID, -1, ObjectType.UIWireframe, 
        [boundPoints[0], boundPoints[1], boundPoints[2], boundPoints[3]], [1,0,0,1], 0, [0.01]));
    }

    SetUIObjArray(uiObjArray);
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
        ResetObjectBoundingBoxPoints(GetPlayerState().tempObject!);
    }
    // If moving an object
    else if(State.action == PlayerAction.MovingObject)
    {
        // Take mouse position

        // Get offset from last mouse position

        // Add offset to every vertex position

        // Update object bounding box

    }
    // If rotating an object
    else if(State.action == PlayerAction.RotatingObject)
    {
        // Take mouse position

        // Calculate angle and remove from current angle

        // Matmul to rotate all vertices accordingly

        // Update object bounding box
    }
}

export function GenerateTemporaryObject(): void
{
    State.tempObjectIsAppendable = IsObjectTypeAppendable(State.selectedTool);
    const objectID = GenerateObjectID();
    State.tempObject = GenerateObj(GetPlayerState().userID, objectID, State.selectedTool, 
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