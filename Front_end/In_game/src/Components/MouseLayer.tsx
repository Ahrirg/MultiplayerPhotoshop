import { useState, useEffect, useRef } from "react";
import {MousePtr} from "./MousePointer";
import "../Css/Mouse.css";

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
  const wsRef = useRef<WebSocket | null>(null);

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
    if (!sessionIp) {
      return;
    }
    const ws = new WebSocket(`ws://${sessionIp.replace("http://", "")}/websockets/mousepointers`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("connected to mouse websocket");
    };

    ws.onmessage = (event) => {
      const data: MousePointerObjs = JSON.parse(event.data);
      // console.log(data)
      if (data.name == username) {
        return;
      }
      setMousePointPos(prev => {
        const others = prev.filter(p => p.name !== data.name);
        return [...others, data];
      });
    };

    return () => {
      ws.close();
    };
  }, [sessionIp]);

  useEffect(() => {
    const interval = setInterval(() => {
      const ws = wsRef.current;

      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const payload = {
        name: username,
        x: mouseX,
        y: mouseY
      };

      ws.send(JSON.stringify(payload));
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