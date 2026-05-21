import { useEffect, useState } from 'react'
import '../Css/colorPicker.css'

interface SliderRowProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  trackClass: string;
  trackStyle?: React.CSSProperties;
  onChange: (v: number) => void;
  unit?: string;
}

function SliderRow({ label, value, min = 0, max = 100, trackClass, trackStyle, onChange, unit = '' }: SliderRowProps) {
  return (
    <div className="ie-row">
      <div className="ie-row-header">
        <span className="ie-label">{label}</span>
        <span className="ie-value">{value}{unit}</span>
      </div>
      <div className={`ie-track ${trackClass}`} style={trackStyle}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="ie-slider"
        />
      </div>
    </div>
  );
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
  transparency: number;
  onBrightnessChange: (h: number) => void;
  onContrastChange: (h: number) => void;
  onSaturationChange: (b: number) => void;
  onTransparencyChange: (v: number) => void;
}

export function ImageEdit({ buttonRef, visible, brightness, contrast, saturation, transparency, onBrightnessChange, onContrastChange, onSaturationChange, onTransparencyChange }: ImageEditProps) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 10, right: window.innerWidth - rect.right });
  }, [buttonRef]);

  return (
    <div
      className={`color-popup ie-panel ${visible ? 'color-popup--visible' : ''}`}
      style={{ top: pos.top, right: pos.right }}
    >
      <span className="ie-title">IMAGE EDIT</span>

      <SliderRow
        label="Brightness"
        value={brightness}
        trackClass="ie-track--brightness"
        onChange={onBrightnessChange}
        unit="%"
      />
      <SliderRow
        label="Contrast"
        value={contrast}
        trackClass="ie-track--contrast"
        onChange={onContrastChange}
        unit="%"
      />
      <SliderRow
        label="Saturation"
        value={saturation}
        trackClass="ie-track--saturation"
        onChange={onSaturationChange}
        unit="%"
      />
      <SliderRow
        label="Opacity"
        value={transparency}
        trackClass="ie-track--transparency"
        onChange={onTransparencyChange}
        unit="%"
      />
    </div>
  );
}
