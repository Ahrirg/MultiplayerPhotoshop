import brushIcon from './assets/paint-brush.svg'
import squareIcon from './assets/square.svg'

interface TopBarProps {
  currentTool: string;
}

// Map the tool names to their imported icons
const toolIcons: Record<string, string> = {
  brush: brushIcon,
  square: squareIcon,
};

export function TopBar({ currentTool }: TopBarProps) {
  return (
    <div className="top">
      {/* Left Corner Indicator */}
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
    </div>
  );
}