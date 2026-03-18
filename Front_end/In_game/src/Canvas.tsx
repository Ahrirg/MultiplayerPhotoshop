import { useEffect } from 'react';
import './Canvas.css'

export function Canvas() {
  useEffect(() => {
    import('../../Canvas/game_loop.ts').then(module => {
      module.initGameLoop();
    });
  }, []);

  return <canvas id="glCanvas" height={800} width={1200}></canvas>
}