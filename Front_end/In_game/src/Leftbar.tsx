import './Containers.css'
import brushIcon from './assets/paint-brush.svg'
import squareIcon from './assets/square.svg'

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
    }
  };

  return (
    <div className="left">
      <button 
        className={`left-btn ${activeTool === 'brush' ? 'active' : ''}`} 
        onClick={() => handleToolClick('brush')}
        title="Brush"
      >
        <img src={brushIcon} alt="Brush" width="35" height="35" />
      </button>

      <button 
        className={`left-btn ${activeTool === 'square' ? 'active' : ''}`} 
        onClick={() => handleToolClick('square')}
        title="Square"
      >
        <img src={squareIcon} alt="Square" width="35" height="35" />
      </button>
    </div>
  );
}