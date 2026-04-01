export class WebsocketWrapper {
    ipaddress;
    websocketObject;
    constructor(sessionIp, websocketChannel, onMessageCallback) {
        this.ipaddress = `ws://${sessionIp.replace("http://", "")}/websockets/${websocketChannel}`;
        this.websocketObject = new WebSocket(this.ipaddress);
        this.websocketObject.onopen = () => {
            console.log(`connected to ${websocketChannel} websocket`);
        };
        this.websocketObject.onmessage = (event) => {
            onMessageCallback(event);
        };
    }
    sendMessage(data) {
        if (typeof data === "string") {
            this.websocketObject.send(data);
        }
        else {
            this.websocketObject.send(JSON.stringify(data));
        }
    }
    getWebsocketObject() {
        return this.websocketObject;
    }
    close() {
        this.websocketObject.close();
    }
}
