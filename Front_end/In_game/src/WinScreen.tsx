import React, { useState } from "react";
import axios from "axios";
import './Css/Win.css'

type LoginOverlayProps = {
  showModal: boolean;
  username: string;
};

export function WinScreen({ showModal, username }: LoginOverlayProps) {
  const [timeToStart, setTimeToStart] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  
  // useEffect(() => {
  //   const getTime = async () => {
  //     try {
  //       const result = await axios.get(`${sessionIp}/status`);
  //       const data = result.data as StatusData;
  //       console.log(data)
        
  //       setTimeToStart(Number(data.game_start));
  //     } catch (err) {
  //       console.error("Failed to fetch time:", err);
  //     }
  //   };
    
  //   if (sessionIp) {
  //     getTime();
  //   }
  // }, [sessionIp]);
  
  // const secondsLeft = Math.max(0, Math.floor((timeToStart - currentTime) / 1000));
  // console.log(secondsLeft)
  // if (timeToStart > 0 && secondsLeft <= 0) {
  //   getRandomRole();
  //   setShowRoom(false);
  // }
  const confettiCount = 200; // Up it for a bigger celebration!
  
  if (!showModal) return null;
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