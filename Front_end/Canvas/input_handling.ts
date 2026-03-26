// import {ObjectType } from "./objects.js";
import { GenerateMessage, MessageType, SendMessage } from "./communication.js";
import { ObjectType, CursorObjectCollision } from "./objects.js";
import {ModifyPlayerState, GetPlayerState, PlayerAction, GenerateTemporaryObject} from "./player_state.js";

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


        // clicked on canvas without a tool -> trying to select an object
    if (GetPlayerState().selectedTool == ObjectType.None)
    {
        console.log("Trying to select");

        // Call a function for collision checking, return correct object
        const selectedObj = CursorObjectCollision(GetPlayerState().mousePosX, GetPlayerState().mousePosY);

        // Set currently selected object to the object we just found
        if(selectedObj != null)
            ModifyPlayerState({action: PlayerAction.Selecting, selectedObject: selectedObj});
        else
            ModifyPlayerState({action: PlayerAction.Idle, selectedObject: null});

    }

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
        // Trying to move object
        if (GetPlayerState().selectedTool == ObjectType.None)
        {

        }
    }
}

function mouseReleased()
{
    if(GetPlayerState().action == PlayerAction.Drawing) // Mouse released -> was drawing, done now
    {
        ModifyPlayerState({action: PlayerAction.Idle});

        // Sending message about object creation to server
        const creationMessage: string = GenerateMessage(GetPlayerState().tempObject, MessageType.ObjectCreated);
        SendMessage(creationMessage);
    }
}