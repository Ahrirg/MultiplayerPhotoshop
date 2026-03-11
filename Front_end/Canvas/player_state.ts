import {ObjectType} from "./objects.js"

interface PlayerState 
{
    selectedTool: ObjectType, 
    selectedColor: string, 
    selectedObjectID: number 
}

let State: PlayerState =
{
    selectedTool: ObjectType.None, 
    selectedColor: "#000000", 
    selectedObjectID: -1 
};

export function ModifyPlayerState(changes: Object)
{
    Object.assign(State, changes);
}

export function GetPlayerState()
{
    return State;
}