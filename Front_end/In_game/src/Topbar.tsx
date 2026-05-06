import { useState, useRef, useEffect, ChangeEvent} from 'react'
import brushIcon from './assets/paint-brush.svg'
import squareIcon from './assets/square.svg'
import ellipseIcon from './assets/ellipse.svg'
import triangleIcon from './assets/triangle.svg'
import pentagonIcon from './assets/pentagon.svg'
import starIcon from './assets/star.svg'
import cropIcon from './assets/crop.svg'
import arrowIcon from './assets/up-arrow.svg'
import hexagonIcon from './assets/hexagon.svg'
import octagonIcon from './assets/octagon.svg'
import semicircleIcon from './assets/semicircle.svg'
import star4Icon from './assets/star4.svg'
import cloudIcon from './assets/cloud.svg'
import { ColorPicker } from './Components/ColorPicker'
import { ImageEdit } from './Components/ImageHueSat'
import { ModifyPlayerState } from '../../Canvas/player_state'
import { WinScreen } from './WinScreen'
import { ImageStorage } from "./utils/imageStorage";

import './Css/topBar.css'
import { RoleInfo } from './Components/Roles'

interface TopBarProps {
  sessionIp: string;
  currentTool: string;
  username: string;
  role: RoleInfo | null;
  imageStorage: ImageStorage | null;
}

const toolIcons: Record<string, string> = {
  Crop: cropIcon,
  Brush: brushIcon,
  Spray: brushIcon,
  Chaotic: brushIcon,
  Rectangle: squareIcon,
  Ellipse: ellipseIcon,
  Triangle: triangleIcon,
  Pentagon: pentagonIcon,
  Star: starIcon,
  Arrow: arrowIcon,
  Star4: star4Icon,
  Hexagon: hexagonIcon,
  Octagon: octagonIcon,
  Semicircle: semicircleIcon,
  Cloud: cloudIcon
};

export function TopBar({ sessionIp, currentTool, username, imageStorage, role}: TopBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showEditing, setEditingPicker] = useState(false);
  const [activeColor, setActiveColor] = useState('#FF0000');
  const [hue, setHue] = useState(0);
  const [brightness, setBrightness] = useState(50);
  const [brightnessImg, setBrightnessImg] = useState(50);
  const [saturation, setSaturation] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [activeImgEdit, setImgEdit] = useState({
     brightness: 1,
     contrast: 1,
     saturation: 1,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [time, setTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];

      try {
        const buffer = await selectedFile.arrayBuffer();
        if (!imageStorage) {
          console.warn("ImageStorage not initialized yet");
          return;
        }
       imageStorage.uploadImage(buffer);
      } catch (error) {
        console.error("Error reading file as ArrayBuffer:", error);
      }
    }
  };

  useEffect(() => {
    function hexToRGBA(hex: string) {
      let cleaned = hex.replace('#', '');

      if (cleaned.length === 3) {
        cleaned = cleaned.split('').map(c => c + c).join('');
      }

      const bigint = parseInt(cleaned, 16);
      const r = ((bigint >> 16) & 255) / 255;
      const g = ((bigint >> 8) & 255) / 255;
      const b = (bigint & 255) / 255;

      return [r, g, b, 1.0]; // RGBA (alpha = 1.0)
    }

    const arrayOf255Values = hexToRGBA(activeColor)
    console.log(`Changed to: ${activeColor}`)
    console.log(arrayOf255Values)
    ModifyPlayerState({selectedColor: [arrayOf255Values[0], arrayOf255Values[1], arrayOf255Values[2], arrayOf255Values[3]]})
  }, [activeColor])

  useEffect(() => {
    console.log(`Changed to: ${activeImgEdit}`)
    ModifyPlayerState({selectedColor: [brightness, saturation, contrast]})
  }, [activeImgEdit])

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
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />

        <button className="top-button" onClick={handleImportClick}>
          <b>IMAGES</b>
          
        </button>

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
        <button 
          className="top-button"
          ref={buttonRef}
          onClick={() => setEditingPicker(p => !p)}
          >
          <b>IMAGE EDIT</b>
        </button>
        {showEditing && (
            <ImageEdit onImgChange={setImgEdit} buttonRef={buttonRef} visible={showEditing} brightness={brightnessImg} contrast={contrast} saturation={saturation} 
            onBrightnessChange={setBrightnessImg} onContrastChange={setContrast} onSaturationChange={setSaturation}/>
          )}
      </div>
      <div className='role-indicator'>
        <strong>
          {role?.title}
        </strong>
      </div>
      <div className='win-screen'>
        <button onClick={()=>{setShowWinScreen(true)}}><b>{time}</b></button>
      </div>
      <WinScreen
        sessionIp={sessionIp}
        setTimeLeft={setTime}
        showModal={showWinScreen}
        username={username}
      />
    </div>
  );
}