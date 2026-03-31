import './Css/Containers.css'
import './Css/LeftButtons.css'

import brushIcon from './assets/paint-brush.svg'
import squareIcon from './assets/square.svg'
import ellipseIcon from './assets/ellipse.svg'
import triangleIcon from './assets/triangle.svg'
import pentagonIcon from './assets/pentagon.svg'
import starIcon from './assets/star.svg'
import arrowIcon from './assets/up-arrow.svg'
import { ModifyPlayerState } from '../../Canvas/player_state'
import { ObjectType } from '../../Canvas/objects'


interface LeftBarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

export function LeftBar({ activeTool, setActiveTool }: LeftBarProps) {
  
  const handleToolClick = (toolName: string) => {
    if (activeTool === toolName) {
      setActiveTool("");
    } else {
      setActiveTool(toolName);
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
      if(toolName == "Arrow")
        ModifyPlayerState({selectedTool: ObjectType.Arrow});
    }
  };

  return (
    <div className="left">
      <button 
        className={`left-btn ${activeTool === 'Brush' ? 'active' : ''}`} 
        onClick={() => handleToolClick('Brush')}
        title="Brush"
      >
        <img src={brushIcon} alt="Brush" width="35" height="35" />
      </button>

      <button 
        className={`left-btn ${activeTool === 'Rectangle' ? 'active' : ''}`} 
        onClick={() => handleToolClick('Rectangle')}
        title="Rectangle"
      >
        <img src={squareIcon} alt="Rectangle" width="35" height="35" />
      </button>

      <button 
        className={`left-btn ${activeTool === 'Ellipse' ? 'active' : ''}`} 
        onClick={() => handleToolClick('Ellipse')}
        title="Ellipse"
      >
        <img src={ellipseIcon} alt="Ellipse" width="35" height="35" />
      </button>

      <button 
        className={`left-btn ${activeTool === 'Triangle' ? 'active' : ''}`} 
        onClick={() => handleToolClick('Triangle')}
        title="Triangle"
      >
        <img src={triangleIcon} alt="Triangle" width="35" height="35" />
      </button>

      <button 
        className={`left-btn ${activeTool === 'Pentagon' ? 'active' : ''}`} 
        onClick={() => handleToolClick('Pentagon')}
        title="Pentagon"
      >
        <img src={pentagonIcon} alt="Pentagon" width="35" height="35" />
      </button>

      <button 
        className={`left-btn ${activeTool === 'Star' ? 'active' : ''}`} 
        onClick={() => handleToolClick('Star')}
        title="Star"
      >
        <img src={starIcon} alt="Star" width="35" height="35" />
      </button>

      <button 
        className={`left-btn ${activeTool === 'Arrow' ? 'active' : ''}`} 
        onClick={() => handleToolClick('Arrow')}
        title="Arrow"
      >
        <img src={arrowIcon} alt="Arrow" width="35" height="35" />
      </button>
    </div>
  );
}