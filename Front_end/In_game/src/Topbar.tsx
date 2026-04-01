import { useState, useRef, useEffect } from 'react'
import brushIcon from './assets/paint-brush.svg'
import squareIcon from './assets/square.svg'
import ellipseIcon from './assets/ellipse.svg'
import triangleIcon from './assets/triangle.svg'
import pentagonIcon from './assets/pentagon.svg'
import starIcon from './assets/star.svg'
import arrowIcon from './assets/up-arrow.svg'
import { ColorPicker } from './Components/ColorPicker'
import { ModifyPlayerState } from '../../Canvas/player_state'
import { WinScreen } from './WinScreen'

import './Css/topBar.css'

interface TopBarProps {
  currentTool: string;
  username: string;
}

const toolIcons: Record<string, string> = {
  Brush: brushIcon,
  Rectangle: squareIcon,
  Ellipse: ellipseIcon,
  Triangle: triangleIcon,
  Pentagon: pentagonIcon,
  Star: starIcon,
  Arrow: arrowIcon,
};

export function TopBar({ currentTool, username}: TopBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [activeColor, setActiveColor] = useState('#FF0000');
  const [hue, setHue] = useState(0);
  const [brightness, setBrightness] = useState(50);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showWinScreen, setShowWinScreen] = useState(false); 
 
  const getRandomRole = () => {
    const roles = ["Imposter", "Player"];
    return roles[Math.floor(Math.random() * roles.length)];
  };
  const [currentRole, setCurrentRole] = useState<string>(() => getRandomRole());

  useEffect(() => {
    function hexToRGBA(hex: string) {
      let cleaned = hex.replace('#', '');

      if (cleaned.length === 3) {
        cleaned = cleaned.split('').map(c => c + c).join('');
      }

      const bigint = parseInt(cleaned, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;

      return [r, g, b, 255]; // RGBA (alpha = 255)
    }

    const arrayOf255Values = hexToRGBA(activeColor)
    console.log(`Changed to: ${activeColor}`)
    ModifyPlayerState({selectedColor: [arrayOf255Values[0], arrayOf255Values[1], arrayOf255Values[2], arrayOf255Values[3]]})
  }, [activeColor])

  return (
    <div className="top">
      <div className="top-tool-indicator">
        {currentTool ? (
          <>
            <img src={toolIcons[currentTool]} alt={currentTool} className="top-icon" />
            <span>{currentTool.toUpperCase()}</span>
          </>
        ) : (
          <span className="no-tool">NO TOOL</span>
        )}
      </div>

      <div className="top-actions">
        <div className="picker-wrapper">
          <button
            ref={buttonRef}
            className="top-button"
            onClick={() => setShowPicker(p => !p)}
            style={{ borderColor: showPicker ? activeColor : 'transparent' }}>
            <span className="top-button-swatch" style={{ background: activeColor }} />
            <b>COLOR</b>
        </button>

          {showPicker && (
            <ColorPicker onColorChange={setActiveColor} buttonRef={buttonRef} visible={showPicker} hue={hue} brightness={brightness} onHueChange={setHue} onBrightnessChange={setBrightness}/>
          )}
        </div>
      </div>

      <div className='role-indicator'>
        <strong>
          {currentRole}
        </strong>
      </div>
      <div className='win-screen'>
        <button onClick={()=>{setShowWinScreen(true)}}><b>GAME END</b></button>
      </div>
      <WinScreen
        showModal={showWinScreen}
        username={username}
      />
    </div>
  );
}