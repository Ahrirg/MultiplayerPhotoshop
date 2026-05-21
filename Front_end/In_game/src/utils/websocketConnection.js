export class WebsocketWrapper {
  ipaddress;
  websocketObject;
  constructor(sessionIp, websocketChannel, onMessageCallback) {
    this.ipaddress = `ws://${sessionIp.replace("http://", "")}/websockets/${websocketChannel}`;

    if (this.ipaddress.includes("127.0.0.1")) {
      const currentHost = window.location.hostname;
      this.ipaddress = this.ipaddress.replace("127.0.0.1", currentHost);
    }
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
    } else {
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
