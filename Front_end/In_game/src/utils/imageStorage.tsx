import { WebsocketWrapper } from "./websocketConnection";

interface Image {
    binaryData: ArrayBuffer;
    imageId: string;
}

interface ImageData {
    id: string,
    image: Image,
}

const hashArrayBuffer = async (ArrayBuffer: ArrayBuffer): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", ArrayBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};


export class ImageStorage {
    ipaddress: string;
    Websocket: WebsocketWrapper;
    userName: string;
    imageStorage: Image[];

    constructor(
        sessionIp: string,
        userName: string,
        newImageCallback: (Image: Image) => void
    ) {
        this.userName = userName;
        this.ipaddress = sessionIp;
        this.imageStorage = [];
        this.Websocket = new WebsocketWrapper(sessionIp, 'image', (event: MessageEvent<any>) => {
            const data: ImageData = JSON.parse(event.data);
            console.log("Got new Image:");
            console.log(data);
            if (data.id == this.userName || this._find_image(data.image.imageId) != null) {return;}
            this.imageStorage.push(data.image);
            newImageCallback(data.image);
        });
    }

    async uploadImage(imageBinaryArrayBuffer: ArrayBuffer): Promise<string> {
        const hash = await hashArrayBuffer(imageBinaryArrayBuffer);
        
        const base64 = btoa(
        String.fromCharCode(...new Uint8Array(imageBinaryArrayBuffer))
        );

        console.log("Sending image:");
        console.log(base64);

        this.Websocket.sendMessage({
        type: "image",
        id: this.userName,
        imageId: hash,
        data: base64
        });

        return hash;
    }
    _find_image(imageid: string): Image | null {
        this.imageStorage.forEach(element => {
            if (element.imageId == imageid) {
                return element
            }
        });

        return null;
    }

    getImages(): Image[] {
        return this.imageStorage;
    }

    updateImages() {
        // TODO CALL API TO get all images
    }

    getImageById(imageId: string): Image | null {
        return this._find_image(imageId);
    }
}