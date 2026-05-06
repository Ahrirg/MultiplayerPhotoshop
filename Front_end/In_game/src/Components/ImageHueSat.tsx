import { useEffect, useRef, useState } from 'react'
import '../Css/colorPicker.css'

const WHEEL_SIZE = 160;
const CENTER = WHEEL_SIZE / 2;
const OUTER_R = CENTER - 4;
const INNER_R = OUTER_R * 0.62;

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

interface ImageEditProps {
  onImgChange?: (values: {
    brightness: number;
    contrast: number;
    saturation: number;
  }) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  visible: boolean;
  saturation: number;
  contrast: number;
  brightness: number;
  onBrightnessChange: (h: number) => void;
  onContrastChange: (h: number) => void;
  onSaturationChange: (b: number) => void;
}

export function ImageEdit({buttonRef, visible, brightness, contrast, saturation, onBrightnessChange, onContrastChange,onSaturationChange }: ImageEditProps) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right,
    });
  }, [buttonRef]);

  return (
    <div
        className={`color-popup ${visible ? 'color-popup--visible' : ''}`}
        style={{ top: pos.top, right: pos.right }}
    >
        <div className="brightness-section">
        <span className="brightness-label">SATURATION</span>
        <div
            className="brightness-track"
            style={{
            background: `linear-gradient(to right, #000, hsl(${Math.round(1)}, 100%, 50%), #fff)`
            }}
        >
            <input
            type="range"
            min={0}
            max={100}
            value={saturation}
            onChange={e => onSaturationChange(Number(e.target.value))}
            className="brightness-slider"
            />
        </div>
        <span className="brightness-label">BRIGHTNESS</span>
         <div
            className="brightness-track"
            style={{
            background: `linear-gradient(to right, #000, hsl(${Math.round(0)}, 100%, 50%), #fff)`
            }}
        >
            <input
            type="range"
            min={0}
            max={100}
            value={brightness}
            onChange={e => onBrightnessChange(Number(e.target.value))}
            className="brightness-slider"
            />
        </div>
        <span className="brightness-label">CONTRAST</span>
         <div
            className="brightness-track"
            style={{
            background: `linear-gradient(to right, #000, hsl(${Math.round(0)}, 100%, 50%), #fff)`
            }}
        >
            <input
            type="range"
            min={0}
            max={100}
            value={contrast}
            onChange={e => onContrastChange(Number(e.target.value))}
            className="brightness-slider"
            />
        </div>
        </div>


    </div>
    );
} 