import {Obj} from "./objects"

export enum MessageType
{
    ObjectModified,
    ObjectCreated
}


export function GenerateMessage(object: Obj | null, type: MessageType)
{
    return "TO IMPLEMENT";
}

export function ParseMessage(message: string)
{
    return "TO IMPLEMENT";
}

export function SendMessage(message: string)
{
    return "TO IMPLEMENT";
}