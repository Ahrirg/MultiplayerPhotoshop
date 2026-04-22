import { WebsocketWrapper } from './websocketConnection.js';
import { AddObject, GenerateObj, GetObjArray, imageCache, Obj, ResetObjInGPUArray } from './objects.js';
import { existingIds } from './player_state.js';
import { createTextureFromArrayBuffer, createTextureFromBitmap } from './renderer.js';
import { glContext } from './game_loop.js';

let ws: WebsocketWrapper;

export function initWebsocketWrapper(serverIP: string)
{
  ws = new WebsocketWrapper(
    serverIP,
    "canvas",
    (event) => handleServerMessage(event)
  );
}

export function sendObjectModificationMessage(changes: Partial<Obj>, objectId: string)
{
  ws.sendMessage({
    type: "modifyObject",
    objectId: objectId,
    changes: changes
  }); 
}

export function sendObjectCreationMessage(object: Obj)
{
  ws.sendMessage({
    type: "createObject",
    obj: object
  }); 
}

function handleImageMessage(img: { binaryData: ArrayBuffer; imageId: string }) {
    const blob = new Blob([img.binaryData]);

    createImageBitmap(blob).then(bitmap => {
        const texture = createTextureFromBitmap(glContext,bitmap);
        imageCache.set(img.imageId, texture);
    });
}

export function handleServerMessage(event: MessageEvent) {
  const message = JSON.parse(event.data);
  
  if (message.type === "image") {
    const binary = Uint8Array.from(
      atob(message.data),
      c => c.charCodeAt(0)
    ).buffer;

    imageCache.set(message.imageId, null);

    createTextureFromArrayBuffer(glContext, binary)
      .then(texture => {
        imageCache.set(message.imageId, texture);
        console.log("Image texture ready:", message.imageId);
      })
      .catch(err => {
        console.error("Failed to create texture:", message.imageId, err);
      });

    return;
  }

  if (message.type === "modifyObject") {
    const obj = GetObjArray().find(o => o.ObjID === message.objectId);
    if (obj) {
      Object.assign(obj, message.changes);
      ResetObjInGPUArray(message.objectId);
    }
  }
  else if (message.type === "createObject")
  {
    if (existingIds.has(message.obj.ObjID)) return;
    existingIds.add(message.obj.ObjID)
    AddObject(message.obj);
  }
}