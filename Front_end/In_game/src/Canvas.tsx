import { useEffect } from 'react';
import './Css/Canvas.css'

interface CanvasProps {
  serverIP: string;
}

export function Canvas({ serverIP }: CanvasProps) {
  useEffect(() => {
    let interval: number | undefined;

    if (!serverIP) {
      interval = window.setInterval(() => {
        console.log("Waiting for serverIP...");
      }, 500);
    } else {
      import("../../Canvas/game_loop.ts").then((module) => {
        module.initGameLoop(serverIP);
      });
    }

    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [serverIP]);

  return <canvas id="glCanvas" height={800} width={1200}></canvas>;
}