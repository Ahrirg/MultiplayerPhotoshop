import { WebsocketWrapper } from './websocketConnection.js';
import { AddObject, GenerateObj, GetObjArray, Obj } from './objects.js';
import {serverIP} from './game_loop.js'

const ws = new WebsocketWrapper(
  serverIP,
  "canvas",
  (event) => handleServerMessage(event)
);

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

export function handleServerMessage(event: MessageEvent) {
  const message = JSON.parse(event.data);
  
  if (message.type === "modifyObject") {
    const obj = GetObjArray().find(o => o.ObjID === message.objectId);
    if (obj) {
      Object.assign(obj, message.changes);
    }
  }
  else if (message.type === "createObject")
  {
    AddObject(message.obj);
  }
}