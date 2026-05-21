export class WebsocketWrapper {
  ipaddress: string;
  websocketObject: WebSocket;
  msgEvent: (event: MessageEvent<unknown>) => void;

  constructor(
    sessionIp: string,
    websocketChannel: string,
    onMessageCallback: (event: MessageEvent<unknown>) => void,
  ) {
    this.ipaddress = `ws://${sessionIp.replace("http://", "")}/websockets/${websocketChannel}`;

    if (this.ipaddress.includes("127.0.0.1")) {
      const currentHost = window.location.hostname;
      this.ipaddress = this.ipaddress.replace("127.0.0.1", currentHost);
    }

    this.websocketObject = new WebSocket(this.ipaddress);
    this.msgEvent = onMessageCallback;

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
      typeof data === "string" ? data : JSON.stringify(data),
    );
  }

  getWebsocketObject() {
    return this.websocketObject;
  }

  async parseHistory(url: string) {
    try {
      if (url.includes("127.0.0.1")) {
        const currentHost = window.location.hostname;
        url = url.replace("127.0.0.1", currentHost);
      }
      console.log(`trying to get history: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const fixed = `[${text}]`;
      const data = await JSON.parse(fixed);

      data.map((row: any) => {
        row.map((datapoint: any) => {
          const event = new MessageEvent("message", {
            data: datapoint,
          });
          this.msgEvent(event);
        });
      });

      console.log(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }

  close() {
    this.websocketObject.close();
  }
}
