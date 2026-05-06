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


interface LeftBarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

export function LeftBar({ activeTool, setActiveTool }: LeftBarProps) {
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
          <button onClick={() => handleToolClick('Chaotic')}>
            CHAOTIC BRUSH
          </button>
          <button onClick={() => handleToolClick('Spray')}>
            SPRAY PAINT
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