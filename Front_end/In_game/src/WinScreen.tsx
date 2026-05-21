import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Css/Win.css";
import { LoseScreen } from "./LoseScreen";
import type { RoleInfo } from "./Components/Roles";

type LoginOverlayProps = {
  sessionIp: string;
  showModal: boolean;
  didwewon: boolean;
  username: string;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  onGameEnd?: () => void;
  role?: RoleInfo | null;
  clickCount?: number;
  timePlayed?: number;
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
  didwewon,
  username,
  setTimeLeft,
  onGameEnd,
  role,
  clickCount = 0,
  timePlayed = 0,
}: LoginOverlayProps) {
  const [timeToStart, setTimeToStart] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [timeEnd, setTimeEnd] = useState<boolean>(false);

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

  // Seconds left calculation
  const secondsLeft = Math.max(
    0,
    Math.floor((timeToStart - currentTime) / 1000),
  );

  // SAFE state updates
  useEffect(() => {
    setTimeLeft(secondsLeft);

    if (timeToStart > 0 && secondsLeft <= 0 && !timeEnd) {
      onGameEnd?.();
      // Delay setting timeEnd so the vote popup/sequence has its 15s window
      setTimeout(() => setTimeEnd(true), 15000);
    }
  }, [secondsLeft, timeToStart, setTimeLeft, onGameEnd, timeEnd]);

  const confettiCount = 200;

  // FIX: If the game hasn't ended via state/props, OR if we explicitly lost, do not show anything.
  if (!showModal && !timeEnd) return null;
  // if (!didwewon) return null;

  return didwewon ? (
    <div className="overlay">
      <div className="modalWin">
        <div className="win-trophies">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="win-trophy"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              🏆
            </span>
          ))}
        </div>

        <h1 className="win-title">You Won!</h1>
        <p className="win-sub">
          Well played, <strong>{username}</strong>.
        </p>
        <p className="win-sub muted">The crowd cheers for you.</p>

        <div className="win-stats">
          <div className="win-stat">
            <span className="win-stat-value">{timePlayed}s</span>
            <span className="win-stat-label">Time Played</span>
          </div>
          <div className="win-stat">
            <span className="win-stat-value">{clickCount}</span>
            <span className="win-stat-label">Clicks</span>
          </div>
        </div>

        <button
          className="win-btn"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `${window.location.origin}`;
          }}
        >
          Return to Lobby
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
  ) : (
    <div>
      <LoseScreen
        sessionIp={sessionIp}
        username={username}
        show={true}
        timePlayed={timePlayed}
        clickCount={clickCount}
        role={role}
      />
    </div>
  );
}
