import { useState } from "react";
import './Css/App.css';
import './Css/Reveal.css';

export type GameRole = {
  title: string;
  description: string;
  color?: string;
};

type RoleRevealProps = {
  role: GameRole;
  onConfirm: () => void;
};

export function RoleRevealOverlay({ role, onConfirm }: RoleRevealProps) {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onConfirm();
  };

  return (
    /* 👇 USE SAME overlay CLASS AS LOGIN */
    <div className="overlay role-overlay">
      <div className="rr-modal rr-reveal-animation">
        <h3 className="rr-subtitle">YOUR ROLE IS</h3>
        
        <h1 className="rr-title" style={{ color: role.color || '#fff' }}>
          {role.title.toUpperCase()}
        </h1>

        <div className="rr-divider" />

        <p className="rr-description">
          {role.description}
        </p>

        <div className="rr-buttons">
          <button className="rr-confirm-btn" onClick={handleClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}