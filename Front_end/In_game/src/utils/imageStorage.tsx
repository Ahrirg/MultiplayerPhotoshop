import { WebsocketWrapper } from "./websocketConnection";

export interface Image {
    binaryData: any;
    imageId: string;
}

interface ImageData {
    id: string,
    data: ArrayBuffer;
    imageId: string;
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
            if (data.id == this.userName || this._find_image(data.imageId) != null) {
                console.warn("skipping image")
                return;
            }
            const img: Image = {
                binaryData: data.data,
                imageId: data.imageId
            }
            this.imageStorage.push(img);
            console.log(this.imageStorage)
            
            console.log("Calling callback")
            newImageCallback(img);
        });
    }

    async uploadImage(imageBinaryArrayBuffer: ArrayBuffer): Promise<string> {
        function arrayBufferToBase64(buffer: ArrayBuffer): string {
            const bytes = new Uint8Array(buffer);
            let binary = "";
            const chunkSize = 0x8000;

            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
            }

            return btoa(binary);
        }

        const hash = await hashArrayBuffer(imageBinaryArrayBuffer);

        const base64 = arrayBufferToBase64(imageBinaryArrayBuffer);

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

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);

    for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }

    return buffer;
}

export function base64ToFile(base64: string, filename: string, mimeType: string): File {
    // If base64 includes header like "data:image/png;base64,..."
    const base64Data = base64.includes(",")
        ? base64.split(",")[1]
        : base64;

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: mimeType });

    return new File([blob], filename, { type: mimeType });
}