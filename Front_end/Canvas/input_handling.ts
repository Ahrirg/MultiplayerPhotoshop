// import {ObjectType } from "./objects.js";
import { sendObjectCreationMessage, sendObjectModificationMessage } from "./communication.js";
import { ObjectType, CursorObjectCollision, CalculateObjGeometricProperties, GenerateObj, AddObject } from "./objects.js";
import {ModifyPlayerState, GetPlayerState, PlayerAction, GenerateTemporaryObject, CursorRotationIconCollision, CursorWireframeCollision, CursorScalingRectangleCollision, existingIds} from "./player_state.js";



export function initInputHandling(canvasID: string): void
{
    const canvas = document.getElementById("glCanvas");

    canvas!.addEventListener("mousedown", mousePressed);
    window.addEventListener("mouseup", mouseReleased);

    canvas!.addEventListener("mouseleave", () => {
        if (GetPlayerState().action !== PlayerAction.Idle) {
            mouseReleased();
        }
    });

    canvas!.addEventListener("mousemove", (e) => {
        const rect = canvas!.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const modX = (x / rect.width) * 2 - 1;
        const modY = (y / rect.height) * -2 + 1;

        ModifyPlayerState({ mousePosX: modX });
        ModifyPlayerState({ mousePosY: modY });
    });

    window.addEventListener("keydown", (e) => {
        if ((e.target as HTMLElement).tagName === "INPUT") return;

        if (e.code === "KeyG") {
            e.preventDefault();

            const state = GetPlayerState();
            const newTool =
                state.selectedTool === ObjectType.Brush
                    ? ObjectType.None
                    : ObjectType.Brush;

            ModifyPlayerState({ selectedTool: newTool });
        }
    });

}

export function CreateAndSendImageObject(imageId: string, width: number, height: number): void
{
    let maxLength = Math.max(width, height);
    width = width / maxLength * 0.6;
    height = height / maxLength * 0.6;

    let pivotPoint: [number, number] = [0, 0];
    let halfWidth = width/2;
    let halfHeight = height/2;

    let corners: number[] = [
        pivotPoint[0] - halfWidth, pivotPoint[1] - halfHeight,
        pivotPoint[0] + halfWidth, pivotPoint[1] - halfHeight,
        pivotPoint[0] + halfWidth, pivotPoint[1] + halfHeight,
        pivotPoint[0] - halfWidth, pivotPoint[1] + halfHeight
    ]

    let imageObj = GenerateObj(GetPlayerState().userID, "", ObjectType.Image, corners, [1,1,1,1], imageId, []);
    imageObj.PivotPoint = pivotPoint;
    AddObject(imageObj);
    existingIds.add(imageObj.ObjID)
    sendObjectCreationMessage(imageObj);
}

function mousePressed()
{
    const state = GetPlayerState();

    if(state.action == PlayerAction.Idle)
    {
        // clicked on canvas with a tool -> trying to draw
        if(state.selectedTool != ObjectType.None)
        {
            GenerateTemporaryObject();
            ModifyPlayerState({action: PlayerAction.Drawing});
        }
    } 
    else if(state.action == PlayerAction.Selecting)
    {
        // Trying to move object (OR rotate object)
        if (state.selectedTool == ObjectType.None)
        {
            let scalingRectangleIndex = CursorScalingRectangleCollision(state.selectedObject!);
            // Check possible collision cases
            if(CursorRotationIconCollision())
            {
                    ModifyPlayerState({action: PlayerAction.RotatingObject});
                    return;
            }
            else if(scalingRectangleIndex != -1)
            {
                    ModifyPlayerState({action: PlayerAction.ScalingObject, howScaleBeLikeWhenWeStartYoooo: structuredClone(state.selectedObject?.Scale),  scalingRectIndex: scalingRectangleIndex, lastFrameMousePos: [state.mousePosX, state.mousePosY], lastRecordedMousePos: [state.mousePosX, state.mousePosY]});
                    return;           
            }
            else if(CursorWireframeCollision(state.selectedObject!))
            {
                    ModifyPlayerState({action: PlayerAction.MovingObject, lastFrameMousePos: [state.mousePosX, state.mousePosY], lastRecordedMousePos: [state.mousePosX, state.mousePosY]});
                    return;
            }
        }
    }

    // clicked on canvas without a tool -> trying to select an object
    if (state.selectedTool == ObjectType.None)
    {
        // Call a function for collision checking, return correct object
        const selectedObj = CursorObjectCollision(state.mousePosX, state.mousePosY);

        // Set currently selected object to the object we just found
        if(selectedObj != null)
        {
            ModifyPlayerState({action: PlayerAction.Selecting, selectedObject: selectedObj});
        }
        else
            ModifyPlayerState({action: PlayerAction.Idle, selectedObject: null});

    }
}

export function mouseReleased()
{
    const state = GetPlayerState()

    if(state.action == PlayerAction.Drawing) // Mouse released -> was drawing, done now
    {
        const tempObj = state.tempObject!;

        CalculateObjGeometricProperties(tempObj);

        // Sending message about object creation to server
        sendObjectCreationMessage(tempObj);
        existingIds.add(tempObj.ObjID);

        ModifyPlayerState({action: PlayerAction.Idle, tempObject: null});
    }
    else if(state.action == PlayerAction.RotatingObject)
    {
        ModifyPlayerState({action: PlayerAction.Selecting});
        sendObjectModificationMessage({Angle: state.selectedObject!.Angle}, state.selectedObject!.ObjID);
    }
    else if(state.action == PlayerAction.MovingObject)
    {
        ModifyPlayerState({action: PlayerAction.Selecting});
        sendObjectModificationMessage({PivotPoint: state.selectedObject?.PivotPoint}, state.selectedObject!.ObjID);     
    }
    else if(state.action == PlayerAction.ScalingObject)
    {
        ModifyPlayerState({action: PlayerAction.Selecting});
        sendObjectModificationMessage({Scale: state.selectedObject?.Scale}, state.selectedObject!.ObjID);     
    }

}