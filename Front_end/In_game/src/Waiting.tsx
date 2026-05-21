import { useEffect, useState } from "react";
import "./Css/waiting.css";
import axios from "axios";
import { ROLES } from "./Components/Roles";
import type { RoleInfo } from "./Components/Roles";

export const CURSOR_OPTIONS = [
  "🐱",
  "🐶",
  "🦊",
  "🐸",
  "🐙",
  "🦄",
  "🐼",
  "🐯",
  "🐧",
  "🐢",
  "🦅",
  "🐝",
  "🦁",
  "🐻",
  "🐨",
  "🐳",
];

type LoginOverlayProps = {
  sessionIp: string;
  seenPlayers: string[];
  userRole: RoleInfo | null;
  setUserRole: React.Dispatch<React.SetStateAction<RoleInfo | null>>;
  cursorEmoji: string;
  setCursorEmoji: React.Dispatch<React.SetStateAction<string>>;
  seenPlayerCursors: Record<string, string>;
};

interface StatusData {
  up: string;
  status: string;
  game_start: string;
  game_end: string;
}

export function Waiting({
  sessionIp,
  seenPlayers,
  userRole,
  setUserRole,
  cursorEmoji,
  setCursorEmoji,
  seenPlayerCursors,
}: LoginOverlayProps) {
  const [showRoom, setShowRoom] = useState(true);
  const [timeToStart, setTimeToStart] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  function getRandomRole() {
    const roles = Object.values(ROLES);
    return roles[Math.floor(Math.random() * roles.length)];
  }

  useEffect(() => {
    const getTime = async () => {
      try {
        if (sessionIp.includes("127.0.0.1")) {
          const currentHost = window.location.hostname;
          sessionIp = sessionIp.replace("127.0.0.1", currentHost);
        }
        const result = await axios.get(`${sessionIp}/status`);
        const data = result.data as StatusData;
        console.log(data);

        setTimeToStart(Number(data.game_start));
      } catch (err) {
        console.error("Failed to fetch time:", err);
      }
    };

    if (sessionIp) {
      getTime();
    }
  }, [sessionIp]);

  // update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!showRoom || !sessionIp) return null;

  const secondsLeft = Math.max(
    0,
    Math.floor((timeToStart - currentTime) / 1000),
  );
  // console.log(secondsLeft)
  if (timeToStart > 0 && secondsLeft <= 0) {
    if (!userRole) {
      setUserRole(getRandomRole());
    }
    setShowRoom(false);
  }

  return (
    <div className="waiting-overlay">
      <div className="waiting-modal">
        <span className="waiting-title">Waiting Room</span>

        <div className="cursor-picker">
          <button
            className="cursor-arrow"
            onClick={() => {
              const idx = CURSOR_OPTIONS.indexOf(cursorEmoji);
              setCursorEmoji(
                CURSOR_OPTIONS[
                  (idx - 1 + CURSOR_OPTIONS.length) % CURSOR_OPTIONS.length
                ],
              );
            }}
          >
            ◀
          </button>
          <span key={cursorEmoji} className="cursor-preview-emoji">
            {cursorEmoji}
          </span>
          <button
            className="cursor-arrow"
            onClick={() => {
              const idx = CURSOR_OPTIONS.indexOf(cursorEmoji);
              setCursorEmoji(CURSOR_OPTIONS[(idx + 1) % CURSOR_OPTIONS.length]);
            }}
          >
            ▶
          </button>
        </div>

        <div className="waiting-divider" />

        <span className="waiting-section-label">Players</span>

        <div className="waiting-player-list">
          {seenPlayers.length === 0 ? (
            <div className="waiting-player-empty">Waiting for players…</div>
          ) : (
            seenPlayers.map((name, i) => (
              <div
                key={name}
                className="waiting-player-row"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="waiting-player-dot" />
                <span className="waiting-player-name">{name}</span>
                {seenPlayerCursors[name] && (
                  <span className="waiting-player-cursor">
                    {seenPlayerCursors[name]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="waiting-divider" />

        <div className="waiting-countdown">
          Starting in <span>{secondsLeft}s</span>
        </div>
      </div>
    </div>
  );
}
