import brushIcon from './assets/paint-brush.svg'
import squareIcon from './assets/square.svg'
import ellipseIcon from './assets/ellipse.svg'
import triangleIcon from './assets/triangle.svg'
import pentagonIcon from './assets/pentagon.svg'
import starIcon from './assets/star.svg'
import arrowIcon from './assets/up-arrow.svg'

import './Css/topBar.css'

interface TopBarProps {
  currentTool: string;
}

// Map the tool names to their imported icons
const toolIcons: Record<string, string> = {
  Brush: brushIcon,
  Rectangle: squareIcon,
  Ellipse: ellipseIcon,
  Triangle: triangleIcon,
  Pentagon: pentagonIcon,
  Star: starIcon,
  Arrow: arrowIcon,
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