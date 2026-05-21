import './Css/Containers.css'
import './Css/LeftButtons.css'
import { useToolButton } from "./Effects";
import { useState } from "react";
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
import { ModifyPlayerState } from '../../Canvas/player_state'
import { ObjectType } from '../../Canvas/objects'
import { useEffect } from 'react'


interface LeftBarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  gameEnded?: boolean;
}

export function LeftBar({ activeTool, setActiveTool, gameEnded }: LeftBarProps) {
  const cropBtn = useToolButton();
  const brushBtn = useToolButton();
  const rectangleBtn = useToolButton();
  const ellipseBtn = useToolButton();
  const triangleBtn = useToolButton();
  const pentagonBtn = useToolButton();
  const starBtn = useToolButton();
  const star4Btn = useToolButton();
  const arrowBtn = useToolButton();
  const hexagonBtn = useToolButton();
  const octagonBtn = useToolButton();
  const semicircleBtn = useToolButton();
  const cloudBtn = useToolButton();
  const [showBrushMenu, setShowBrushMenu] = useState(false);

  useEffect(() => {
    if (gameEnded) setShowBrushMenu(false);
  }, [gameEnded]);

  const handleToolClick = (toolName: string) => {
    if (activeTool === toolName) {
      setActiveTool("");
      ModifyPlayerState({selectedTool: ObjectType.None});
    } else {
      setActiveTool(toolName);
      if(toolName == "Crop")
        ModifyPlayerState({selectedTool: ObjectType.UIWireframe});
      if(toolName == "Brush")
        ModifyPlayerState({selectedTool: ObjectType.Brush});
      if(toolName == "Rectangle")
        ModifyPlayerState({selectedTool: ObjectType.Rectangle});
      if(toolName == "Ellipse")
        ModifyPlayerState({selectedTool: ObjectType.Ellipse});
      if(toolName == "Triangle")
        ModifyPlayerState({selectedTool: ObjectType.Triangle});
      if(toolName == "Pentagon")
        ModifyPlayerState({selectedTool: ObjectType.Pentagon});
      if(toolName == "Star")
        ModifyPlayerState({selectedTool: ObjectType.Star});
      if(toolName == "Star4")
        ModifyPlayerState({selectedTool: ObjectType.FPStar});
      if(toolName == "Arrow")
        ModifyPlayerState({selectedTool: ObjectType.Arrow});
      if(toolName == "Hexagon")
        ModifyPlayerState({selectedTool: ObjectType.Hexagon});
      if(toolName == "Octagon")
        ModifyPlayerState({selectedTool: ObjectType.Octagon});
      if(toolName == "Semicircle")
        ModifyPlayerState({selectedTool: ObjectType.Semicircle});
      if(toolName == "Cloud")
        ModifyPlayerState({selectedTool: ObjectType.Cloud});
      if(toolName == "Chaotic")
        ModifyPlayerState({selectedTool: ObjectType.ChaoticBrush});
      if(toolName == "Calligraphy")
        ModifyPlayerState({selectedTool: ObjectType.CalligraphyBrush});
      if(toolName == "Rainbow")
        ModifyPlayerState({selectedTool: ObjectType.RainbowBrush});
      if(toolName == "Spray")
        ModifyPlayerState({selectedTool: ObjectType.SprayBrush});
    }
  };

  return (
    <div className="left">
    <div className="brush-wrapper">
      <button 
        ref={brushBtn.ref}
        className={`left-btn ${activeTool === 'Brush' ? 'active' : ''}`}
        onMouseEnter={brushBtn.hoverIn}
        onMouseLeave={brushBtn.hoverOut}
        onClick={() => { 
          brushBtn.click(); 
          handleToolClick('Brush'); 
          setShowBrushMenu(false);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowBrushMenu(prev => !prev);
        }}
        title="Brush"
      >
        <img src={brushIcon} alt="Brush" width="35" height="35" />
      </button>

      {showBrushMenu && (
        <div className="brush-submenu">
          <span className="brush-submenu-label">Brush Type</span>

          <button
            className={activeTool === 'Brush' ? 'brush-active' : ''}
            onClick={() => { handleToolClick('Brush'); setShowBrushMenu(false); }}
          >
            <svg className="brush-btn-preview" viewBox="0 0 160 14" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7 Q40 3 80 7 Q120 11 156 7" stroke="#aaa" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
            <span className="brush-btn-name">Standard Brush</span>
            <span className="brush-btn-desc">Smooth, continuous stroke</span>
          </button>

          <button
            className={activeTool === 'Chaotic' ? 'brush-active' : ''}
            onClick={() => { handleToolClick('Chaotic'); setShowBrushMenu(false); }}
          >
            <svg className="brush-btn-preview" viewBox="0 0 160 14" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 9 L18 4 L30 11 L44 3 L58 10 L72 5 L86 12 L100 4 L114 9 L128 3 L142 10 L156 6" stroke="#aaa" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="brush-btn-name">Chaotic Brush</span>
            <span className="brush-btn-desc">Jagged, expressive strokes</span>
          </button>

          <button
            className={activeTool === 'Spray' ? 'brush-active' : ''}
            onClick={() => { handleToolClick('Spray'); setShowBrushMenu(false); }}
          >
            <svg className="brush-btn-preview" viewBox="0 0 160 14" xmlns="http://www.w3.org/2000/svg">
              {Array.from({length: 28}).map((_, i) => (
                <circle
                  key={i}
                  cx={6 + i * 5.5 + (i % 3 - 1) * 3}
                  cy={7 + (i % 5 - 2) * 2.2}
                  r={i % 4 === 0 ? 1.5 : 1}
                  fill="#aaa"
                  opacity={0.5 + (i % 3) * 0.2}
                />
              ))}
            </svg>
            <span className="brush-btn-name">Spray Paint</span>
            <span className="brush-btn-desc">Scattered dot pattern</span>
          </button>

          <button
            className={activeTool === 'Calligraphy' ? 'brush-active' : ''}
            onClick={() => { handleToolClick('Calligraphy'); setShowBrushMenu(false); }}
          >
            <svg className="brush-btn-preview" viewBox="0 0 160 14" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 11 Q30 2 60 8 Q90 13 120 4 Q140 0 156 5" stroke="#aaa" strokeWidth="1" fill="none" strokeLinecap="round"/>
              <path d="M4 11 Q30 2 60 8 Q90 13 120 4 Q140 0 156 5" stroke="#aaa" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.18"/>
            </svg>
            <span className="brush-btn-name">Calligraphy</span>
            <span className="brush-btn-desc">Thin-to-thick ink strokes</span>
          </button>

          <button
            className={activeTool === 'Rainbow' ? 'brush-active' : ''}
            onClick={() => { handleToolClick('Rainbow'); setShowBrushMenu(false); }}
          >
            <svg className="brush-btn-preview" viewBox="0 0 160 14" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="rainbow-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#ff4444"/>
                  <stop offset="25%"  stopColor="#ffaa00"/>
                  <stop offset="50%"  stopColor="#44dd44"/>
                  <stop offset="75%"  stopColor="#4488ff"/>
                  <stop offset="100%" stopColor="#cc44ff"/>
                </linearGradient>
              </defs>
              <path d="M4 7 Q40 3 80 7 Q120 11 156 7" stroke="url(#rainbow-grad)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            </svg>
            <span className="brush-btn-name">Rainbow</span>
            <span className="brush-btn-desc">Full-spectrum colour trail</span>
          </button>
        </div>
      )}
    </div>

      <button 
        ref={rectangleBtn.ref}
        className={`left-btn ${activeTool === 'Rectangle' ? 'active' : ''}`}
        onMouseEnter={rectangleBtn.hoverIn}
        onMouseLeave={rectangleBtn.hoverOut}
        onClick={() => { rectangleBtn.click(); handleToolClick('Rectangle'); }}
        title="Rectangle"
      >
        <img src={squareIcon} alt="Rectangle" width="35" height="35" />
      </button>

      <button 
        ref={ellipseBtn.ref}
        className={`left-btn ${activeTool === 'Ellipse' ? 'active' : ''}`}
        onMouseEnter={ellipseBtn.hoverIn}
        onMouseLeave={ellipseBtn.hoverOut}
        onClick={() => { ellipseBtn.click(); handleToolClick('Ellipse'); }}
        title="Ellipse"
      >
        <img src={ellipseIcon} width="35" height="35"/>
      </button>

      <button
        ref={triangleBtn.ref}
        className={`left-btn ${activeTool === 'Triangle' ? 'active' : ''}`}
        onMouseEnter={triangleBtn.hoverIn}
        onMouseLeave={triangleBtn.hoverOut}
        onClick={() => { triangleBtn.click(); handleToolClick('Triangle'); }}
        title="Triangle"
      >
        <img src={triangleIcon} width="35" height="35"/>
      </button>

      <button
        ref={pentagonBtn.ref}
        className={`left-btn ${activeTool === 'Pentagon' ? 'active' : ''}`}
        onMouseEnter={pentagonBtn.hoverIn}
        onMouseLeave={pentagonBtn.hoverOut}
        onClick={() => { pentagonBtn.click(); handleToolClick('Pentagon'); }}
        title="Pentagon"
      >
        <img src={pentagonIcon} width="35" height="35"/>
      </button>

      <button
        ref={starBtn.ref}
        className={`left-btn ${activeTool === 'Star' ? 'active' : ''}`}
        onMouseEnter={starBtn.hoverIn}
        onMouseLeave={starBtn.hoverOut}
        onClick={() => { starBtn.click(); handleToolClick('Star'); }}
        title="Star"
      >
        <img src={starIcon} width="35" height="35"/>
      </button>

      <button
        ref={star4Btn.ref}
        className={`left-btn ${activeTool === 'Star4' ? 'active' : ''}`}
        onMouseEnter={star4Btn.hoverIn}
        onMouseLeave={star4Btn.hoverOut}
        onClick={() => { star4Btn.click(); handleToolClick('Star4'); }}
        title="Star4"
      >
        <img src={star4Icon} width="35" height="35"/>
      </button>

      <button
        ref={arrowBtn.ref}
        className={`left-btn ${activeTool === 'Arrow' ? 'active' : ''}`}
        onMouseEnter={arrowBtn.hoverIn}
        onMouseLeave={arrowBtn.hoverOut}
        onClick={() => { arrowBtn.click(); handleToolClick('Arrow'); }}
        title="Arrow"
      >
        <img src={arrowIcon} width="35" height="35"/>
      </button>

      <button
        ref={hexagonBtn.ref}
        className={`left-btn ${activeTool === 'Hexagon' ? 'active' : ''}`}
        onMouseEnter={hexagonBtn.hoverIn}
        onMouseLeave={hexagonBtn.hoverOut}
        onClick={() => { hexagonBtn.click(); handleToolClick('Hexagon'); }}
        title="Hexagon"
      >
        <img src={hexagonIcon} width="35" height="35"/>
      </button>

      <button
        ref={octagonBtn.ref}
        className={`left-btn ${activeTool === 'Octagon' ? 'active' : ''}`}
        onMouseEnter={octagonBtn.hoverIn}
        onMouseLeave={octagonBtn.hoverOut}
        onClick={() => { octagonBtn.click(); handleToolClick('Octagon'); }}
        title="Octagon"
      >
        <img src={octagonIcon} width="35" height="35"/>
      </button>

      <button
        ref={semicircleBtn.ref}
        className={`left-btn ${activeTool === 'Semicircle' ? 'active' : ''}`}
        onMouseEnter={semicircleBtn.hoverIn}
        onMouseLeave={semicircleBtn.hoverOut}
        onClick={() => { semicircleBtn.click(); handleToolClick('Semicircle'); }}
        title="Semicircle"
      >
        <img src={semicircleIcon} width="35" height="35"/>
      </button>

      <button
        ref={cloudBtn.ref}
        className={`left-btn ${activeTool === 'Cloud' ? 'active' : ''}`}
        onMouseEnter={cloudBtn.hoverIn}
        onMouseLeave={cloudBtn.hoverOut}
        onClick={() => { cloudBtn.click(); handleToolClick('Cloud'); }}
        title="Cloud"
      >
        <img src={cloudIcon} width="35" height="35"/>
      </button>
    </div>
  );
}