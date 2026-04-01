import { useState, useEffect, useRef } from "react";
import {MousePtr} from "./MousePointer";
import "../Css/Mouse.css";
import {WebsocketWrapper} from "../utils/websocketConnection"

type SessionData = {
  username: string;
  sessionIp: string;
};

type MousePointerObjs = {
  name: string;
  x: number;
  y: number;
}

export function MouseLayer({ username, sessionIp }: SessionData) {

  const [mousePointPos, setMousePointPos] = useState<MousePointerObjs[]>([]);
  const websocketRef = useRef<WebsocketWrapper | null>(null);
  // const WebsocketOBJ = useRef<WebsocketWrapper | null>(null);

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      setMouseX(x);
      setMouseY(y);
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  useEffect(() => {
    if (!sessionIp) return;

    function onMsg(event: MessageEvent<any>) {
      const data: MousePointerObjs = JSON.parse(event.data);

      if (data.name === username) return;

      setMousePointPos(prev => {
        const others = prev.filter(p => p.name !== data.name);
        return [...others, data];
      });
    }

    const ws = new WebsocketWrapper(sessionIp, "mousepointers", onMsg);
    websocketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [sessionIp, username]);

  useEffect(() => {
    const interval = setInterval(() => {
      const websocketOBJ = websocketRef.current;
      if (!websocketOBJ) return;

      const ws = websocketOBJ.getWebsocketObject();
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const payload = {
        name: username,
        x: mouseX,
        y: mouseY
      };

      websocketOBJ.sendMessage(JSON.stringify(payload));
    }, 10);

    return () => clearInterval(interval);
  }, [username, mouseX, mouseY]);

  return (
    <div
      className="mouse-overlay"
    >
      {mousePointPos.map((ptr) => (
        <MousePtr
          key={ptr.name}
          color=""
          RelativeX={ptr.x}
          RelativeY={ptr.y}
          name={ptr.name}
        />
      ))}
    </div>
  );
}