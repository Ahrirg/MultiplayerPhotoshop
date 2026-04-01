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

interface ColorPickerProps {
  onColorChange?: (hex: string) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  visible: boolean;
  hue: number;
  brightness: number;
  onHueChange: (h: number) => void;
  onBrightnessChange: (b: number) => void;
}

export function ColorPicker({ onColorChange, buttonRef, visible, hue, brightness, onHueChange, onBrightnessChange }: ColorPickerProps) {
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  const selectedColor = `hsl(${Math.round(hue)}, 100%, ${brightness}%)`;
  const hexColor = hslToHex(Math.round(hue), 100, brightness).toUpperCase();

  // Calculate fixed position from button
  useEffect(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right,
    });
  }, [buttonRef]);

  useEffect(() => {
    onColorChange?.(hexColor);
  }, [hexColor]);

  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    for (let angle = 0; angle < 360; angle++) {
      const start = ((angle - 1) * Math.PI) / 180;
      const end = ((angle + 1) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, OUTER_R, start, end);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, INNER_R, 0, 2 * Math.PI);
    ctx.fillStyle = '#2a2a2a';
    ctx.fill();

    const rad = (hue * Math.PI) / 180;
    const r = (OUTER_R + INNER_R) / 2;
    const dx = CENTER + r * Math.cos(rad);
    const dy = CENTER + r * Math.sin(rad);

    ctx.beginPath();
    ctx.arc(dx, dy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(dx, dy, 6, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(dx, dy, 4, 0, 2 * Math.PI);
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fill();
  }, [hue]);

  const pickHue = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER;
    const y = e.clientY - rect.top - CENTER;
    const dist = Math.sqrt(x * x + y * y);
    if (dist < INNER_R || dist > OUTER_R) return;
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    onHueChange(angle < 0 ? angle + 360 : angle);
  };

  return (
    <div
        className={`color-popup ${visible ? 'color-popup--visible' : ''}`}
        style={{ top: pos.top, right: pos.right }}
    >
        <p className="popup-label">COLOR</p>

        <canvas
        ref={wheelRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        className="color-wheel"
        onMouseDown={() => { isDragging.current = true; }}
        onMouseUp={() => { isDragging.current = false; }}
        onClick={pickHue}
        onMouseMove={e => { if (isDragging.current) pickHue(e); }}
        />

        <div className="brightness-section">
        <span className="brightness-label">BRIGHTNESS</span>
        <div
            className="brightness-track"
            style={{
            background: `linear-gradient(to right, #000, hsl(${Math.round(hue)}, 100%, 50%), #fff)`
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
        </div>

        <div className="color-preview-row">
        <div className="color-swatch" style={{ background: selectedColor }} />
        <span className="color-hex">{hexColor}</span>
        </div>
    </div>
    );
} 