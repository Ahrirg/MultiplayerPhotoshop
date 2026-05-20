import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Css/Win.css";

type LoginOverlayProps = {
  sessionIp: string;
  showModal: boolean;
  username: string;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  onGameEnd?: () => void;
};

interface StatusData {
  up: string;
  status: string;
  game_start: string;
  game_end: string;
}

export function WinScreen({
  sessionIp,
  showModal,
  username,
  setTimeLeft,
  onGameEnd,
}: LoginOverlayProps) {
  const [timeToStart, setTimeToStart] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [timeEnd, setTimeEnd] = useState<boolean>(false);

  // NEW: gameplay stats
  const [timePlayed, setTimePlayed] = useState<number>(0);
  const [clickCount, setClickCount] = useState<number>(0);

  // Fetch game status
  useEffect(() => {
    const getTime = async () => {
      try {
        const result = await axios.get(`${sessionIp}/status`);
        const data = result.data as StatusData;

        const end = Number(data.game_end);

        setTimeToStart(Number.isFinite(end) ? end : 0);
      } catch (err) {
        console.error("Failed to fetch time:", err);
      }
    };

    if (sessionIp) {
      getTime();
    }
  }, [sessionIp]);

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Time played counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (!timeEnd) {
        setTimePlayed((t) => t + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Seconds left calculation
  const secondsLeft = Math.max(
    0,
    Math.floor((timeToStart - currentTime) / 1000),
  );

  // SAFE state updates (fixes React #301 crash)
  useEffect(() => {
    setTimeLeft(secondsLeft);

    if (timeToStart > 0 && secondsLeft <= 0) {
      onGameEnd?.();
      setTimeout(() => setTimeEnd(true), 15000);
    }
  }, [secondsLeft, timeToStart, setTimeLeft]);

  const confettiCount = 200;

  if (!showModal && !timeEnd) return null;

  return (
    <div className="overlay" onClick={() => setClickCount((c) => c + 1)}>
      <div className="modalWin">
        <h1>🎉 You Won 🎉</h1>
        <h2>{username}</h2>

        <p>⏱️ Time played: {timePlayed}s</p>
        <p>🖱️ Clicks: {clickCount}</p>

        <br />

        <button
          onClick={() => {
            setClickCount((c) => c + 1);
            window.location.href = `${window.location.origin}`;
          }}
        >
          <b>Return To Lobby</b>
        </button>
      </div>

      <div className="confetti-container">
        {Array.from({ length: confettiCount }).map((_, i) => {
          const randomX = Math.floor(Math.random() * 1000) - 500;
          const randomDelay = Math.random() * 0.6;

          return (
            <div
              key={i}
              className="confetti"
              style={{
                ["--x" as any]: `${randomX}px`,
                animationDelay: `${randomDelay}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
