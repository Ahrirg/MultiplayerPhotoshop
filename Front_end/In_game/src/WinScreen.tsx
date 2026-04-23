import React, { useState, useEffect } from "react";
import axios from "axios";
import './Css/Win.css'

type LoginOverlayProps = {
  sessionIp: string;
  showModal: boolean;
  username: string;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
};

interface StatusData {
  up: string;
  status: string;
  game_start: string;
  game_end: string;
}

export function WinScreen({ sessionIp, showModal, username, setTimeLeft }: LoginOverlayProps) {
  const [timeToStart, setTimeToStart] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [timeEnd, setTimeEnd] = useState<boolean>(false);
  
  useEffect(() => {
    const getTime = async () => {
      try {
        const result = await axios.get(`${sessionIp}/status`);
        const data = result.data as StatusData;
        console.log(data)
        
        setTimeToStart(Number(data.game_end));
      } catch (err) {
        console.error("Failed to fetch time:", err);
      }
    };
    
    if (sessionIp) {
      getTime();
    }
  }, [sessionIp]);

  useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
  
      return () => clearInterval(interval);
  }, []);
  
  const secondsLeft = Math.max(0, Math.floor((timeToStart - currentTime) / 1000));
  setTimeLeft(secondsLeft);
  // console.log(secondsLeft)
  if (timeToStart > 0 && secondsLeft <= 0) {
    setTimeEnd(true);
  }
  const confettiCount = 200; // Up it for a bigger celebration!
  
  if (!showModal && !timeEnd) return null;
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