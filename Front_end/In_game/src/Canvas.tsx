import { useEffect } from 'react';
import './Canvas.css'

export function Canvas() {
  useEffect(() => {
    // No idea why, but dynamic import solves the double import issue
    // a.k.a. if you import game_loop.ts normally, you get duplicate player states
    // and it doesn't work correctly
    import('../../Canvas/game_loop.ts').then(module => {
      module.initGameLoop();
    });
  }, []);

  return <canvas id="glCanvas"></canvas>
}