export class WebsocketWrapper {
    ipaddress: string;
    websocketObject: WebSocket;

    constructor(
        sessionIp: string,
        websocketChannel: string,
        onMessageCallback: (event: MessageEvent<unknown>) => void
    ) {
        this.ipaddress = `ws://${sessionIp.replace("http://", "")}/websockets/${websocketChannel}`;
        this.websocketObject = new WebSocket(this.ipaddress);

        this.websocketObject.onopen = () => {
            console.log(`connected to ${websocketChannel} websocket`);
        };

        this.websocketObject.onmessage = (event) => {
            onMessageCallback(event);
        };
    }

    sendMessage(data: string): void;
    sendMessage(data: Record<string, unknown>): void;
    sendMessage(data: unknown): void {
        if (this.websocketObject.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not ready yet, dropping message");
            return;
        }

        this.websocketObject.send(
            typeof data === "string" ? data : JSON.stringify(data)
        );
    }

    getWebsocketObject() {
        return this.websocketObject
    }

    close() {
        this.websocketObject.close();
    }
}