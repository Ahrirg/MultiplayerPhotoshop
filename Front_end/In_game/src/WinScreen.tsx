import React, { useState } from "react";
import axios from "axios";
import './Css/Win.css'

type LoginOverlayProps = {
  showModal: boolean;
  username: string;
};

export function WinScreen({ showModal, username }: LoginOverlayProps) {
  if (!showModal) return null;

  const confettiCount = 200; // Up it for a bigger celebration!

  return (
    <div className="overlay">
      <div className="modalWin">
        <h1>🎉 You Won 🎉</h1>
        <h2>{username}</h2>
        <br/>
        <button onClick={()=>{window.location.href = `${window.location.origin}`}}><b>Return To Lobby</b></button>
      </div>

      <div className="confetti-container">
        {Array.from({ length: confettiCount }).map((_, i) => {
          // Wider spread for a 700px wide modal
          const randomX = Math.floor(Math.random() * 1000) - 500;
          const randomDelay = Math.random() * 0.6;
          
          return (
            <div
              key={i}
              className="confetti"
              style={{
                ['--x' as any]: `${randomX}px`,
                animationDelay: `${randomDelay}s`,
              }}
            />
          );
        })}
      
      </div>
    </div>
  );
}