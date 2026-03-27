// import {ObjectType } from "./objects.js";
import { GenerateMessage, MessageType, SendMessage } from "./communication.js";
import { ObjectType, CursorObjectCollision, ResetObjectBoundingBoxPoints } from "./objects.js";
import {ModifyPlayerState, GetPlayerState, PlayerAction, GenerateTemporaryObject, CursorRotationIconCollision} from "./player_state.js";

// TODO: set state from "Drawing" to "Idle" if the cursor leaves the canvas

export function initInputHandling(canvasID: string): void
{
    const canvas = document.getElementById("glCanvas");

    canvas!.addEventListener("mousedown", mousePressed);
    canvas!.addEventListener("mouseup", mouseReleased);

    canvas!.addEventListener("mousemove", (e) => {
        const rect = canvas!.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const modX = (x / rect.width) * 2 - 1;
        const modY = (y / rect.height) * -2 + 1;

        ModifyPlayerState({ mousePosX: modX });
        ModifyPlayerState({ mousePosY: modY });
    });

    // TOOL TOGGLE FOR DEBUGGING
    window.addEventListener("keydown", (e) => {
        if (e.key === "g") {
            console.log("G pressed");
            if(GetPlayerState().selectedTool == ObjectType.None)
            {
                ModifyPlayerState({ selectedTool: ObjectType.Brush, action: PlayerAction.Idle });
            }
            else
                ModifyPlayerState({ selectedTool: ObjectType.None });
        }
    });
}

function mousePressed()
{
    const currState = GetPlayerState();


    if(GetPlayerState().action == PlayerAction.Idle)
    {
        // clicked on canvas with a tool -> trying to draw
        if(GetPlayerState().selectedTool != ObjectType.None)
        {
            GenerateTemporaryObject();
            ModifyPlayerState({action: PlayerAction.Drawing});
        }
    } 
    else if(GetPlayerState().action == PlayerAction.Selecting)
    {
        // Trying to move object (OR rotate object)
        if (GetPlayerState().selectedTool == ObjectType.None)
        {
            // Check possible collision cases
            if(CursorRotationIconCollision(GetPlayerState().mousePosX, GetPlayerState().mousePosY))
                {
                    ModifyPlayerState({action: PlayerAction.RotatingObject});
                    console.log("ROTATING!!!");
                    return;
                }
        }
    }

    // clicked on canvas without a tool -> trying to select an object
    if (GetPlayerState().selectedTool == ObjectType.None)
    {

        // Call a function for collision checking, return correct object
        const selectedObj = CursorObjectCollision(GetPlayerState().mousePosX, GetPlayerState().mousePosY);

        // Set currently selected object to the object we just found
        if(selectedObj != null)
            ModifyPlayerState({action: PlayerAction.Selecting, selectedObject: selectedObj});
        else
            ModifyPlayerState({action: PlayerAction.Idle, selectedObject: null});

    }
}

function mouseReleased()
{
    if(GetPlayerState().action == PlayerAction.Drawing) // Mouse released -> was drawing, done now
    {
        const tempObj = GetPlayerState().tempObject!;

        ResetObjectBoundingBoxPoints(tempObj);
        const cx = (tempObj.BoundingBoxPoints[0]+tempObj.BoundingBoxPoints[2])/2;
        const cy = (tempObj.BoundingBoxPoints[1]+tempObj.BoundingBoxPoints[3])/2;

        tempObj.PivotPoint = [cx, cy];

        // Sending message about object creation to server
        const creationMessage: string = GenerateMessage(tempObj, MessageType.ObjectCreated);
        SendMessage(creationMessage);


        ModifyPlayerState({action: PlayerAction.Idle});
    }
    if(GetPlayerState().action == PlayerAction.RotatingObject) // Mouse released -> was rotating, done now
    {
        ModifyPlayerState({action: PlayerAction.Selecting});
        ResetObjectBoundingBoxPoints(GetPlayerState().selectedObject!);
    }
}