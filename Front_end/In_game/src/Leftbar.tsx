import './Containers.css'
import brushIcon from './assets/paint-brush.svg'
import squareIcon from './assets/square.svg'
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
    </div>
  );
}