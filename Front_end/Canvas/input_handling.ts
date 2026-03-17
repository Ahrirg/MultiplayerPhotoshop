import {ObjectType } from "./objects.js";
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
}

function mousePressed()
{
    const currState = GetPlayerState();

    if(GetPlayerState().action == PlayerAction.Idle)
    {
        GenerateTemporaryObject();

        // Later check if a tool is selected before setting this flag
        ModifyPlayerState({action: PlayerAction.Drawing});
    } 
    else if(GetPlayerState().action == PlayerAction.Selecting)
    {
        // PLACEHOLDER
    }
}

function mouseReleased()
{
    if(GetPlayerState().action == PlayerAction.Drawing)
    {
        ModifyPlayerState({action: PlayerAction.Idle});
    }
}