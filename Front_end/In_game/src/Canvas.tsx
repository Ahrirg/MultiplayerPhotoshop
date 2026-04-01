import { useEffect } from 'react';
import './Css/Canvas.css'

interface CanvasProps {
  serverIP: string;
}

export function Canvas({ serverIP}: CanvasProps) {
  useEffect(() => {
    import('../../Canvas/game_loop.ts').then(module => {
      module.initGameLoop(serverIP);
    });
  }, [serverIP]);

  return <canvas id="glCanvas" height={800} width={1200}></canvas>
}