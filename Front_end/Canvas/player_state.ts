import {ObjectType, Obj, IsObjectTypeAppendable, GenerateObj, AddObject} from "./objects.js"

export enum PlayerAction
{
    Idle, 
    Drawing, 
    Selecting
    // modifying? moving?
}

interface PlayerState 
{
    selectedTool: ObjectType, 
    selectedColor: [number, number, number, number], 
    selectedObjectID: number 
    action: PlayerAction
    mousePosX: number,
    mousePosY: number,
    tempObject: Obj | null
    tempObjectIsAppendable: boolean
}

let State: PlayerState =
{
    selectedTool: ObjectType.None, 
    selectedColor: [0,0,0,0], 
    selectedObjectID: -1, 
    action: PlayerAction.Idle,
    mousePosX: 0,
    mousePosY: 0,
    tempObject: null,
    tempObjectIsAppendable: false
};

export function ModifyPlayerState(changes: Object)
{
    Object.assign(State, changes);
}

export function GetPlayerState()
{
    return State;
}


// TEMPORARY OBJECT RELATED CODE
export function HandleTemporaryObjects(): void
{
    if(State.action == PlayerAction.Drawing)
    {
        UpdateTemporaryObject();
    }
}

export function GenerateTemporaryObject(): void
{
    State.tempObjectIsAppendable = IsObjectTypeAppendable(State.selectedTool);
    State.tempObject = GenerateObj(0, -1, State.selectedTool, 
            [State.mousePosX, State.mousePosY, State.mousePosX+0.1, State.mousePosY+0.1], 
            [0.9,0.1,0.1,1.0], 0, []);
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