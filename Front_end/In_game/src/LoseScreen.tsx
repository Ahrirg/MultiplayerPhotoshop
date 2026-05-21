import { useEffect, useState } from "react";
import axios from "axios";
import type { RoleInfo } from "./Components/Roles";
import "./Css/Lose.css";

interface LoseScreenProps {
  sessionIp: string;
  username: string;
  show: boolean;
  timePlayed?: number;
  clickCount?: number;
  role?: RoleInfo | null;
}

interface VoteResults {
  [player: string]: number;
}

export function LoseScreen({ sessionIp, username, show, timePlayed = 0, clickCount = 0, role }: LoseScreenProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // If show prop is false, clear visibility and exit
    if (!show || !sessionIp || !username) {
      setVisible(false);
      return;
    }

    const check = async () => {
      try {
        const res = await axios.get(`${sessionIp}/vote/results`);
        const results = res.data as VoteResults;

        const maxVotes = Math.max(0, ...Object.values(results));
        if (maxVotes === 0) return;

        const topPlayers = Object.entries(results)
          .filter(([, v]) => v === maxVotes)
          .map(([k]) => k);

        if (topPlayers.includes(username)) {
          setVisible(true);
        }
      } catch (err) {
        console.error("Failed to fetch vote results on lose screen:", err);
      }
    };

    // Run immediately on mount/update
    check();

    // Poll every 1000ms to catch the data as soon as the server tallies the votes
    const intervalId = setInterval(check, 1000);

    return () => clearInterval(intervalId);
  }, [show, sessionIp, username]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 350);
  };

  return (
    <div className={`lose-overlay ${closing ? "lose-overlay--out" : ""}`}>
      <div className={`lose-modal ${closing ? "lose-modal--out" : ""}`}>
        <div className="lose-skulls">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="lose-skull"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              💀
            </span>
          ))}
        </div>

        <h1 className="lose-title">You Were Voted Out</h1>
        {role?.title === "Mafia" ? (
          <>
            <p className="lose-sub">
              The players saw through you, <strong>{username}</strong>.
            </p>
            <p className="lose-sub muted">Your cover was blown. Better luck next round.</p>
          </>
        ) : (
          <>
            <p className="lose-sub">
              The crew turned on you, <strong>{username}</strong>.
            </p>
            <p className="lose-sub muted">You were innocent. Justice was not served.</p>
          </>
        )}

        <div className="lose-stats">
          <div className="lose-stat">
            <span className="lose-stat-value">{timePlayed}s</span>
            <span className="lose-stat-label">Time Played</span>
          </div>
          <div className="lose-stat">
            <span className="lose-stat-value">{clickCount}</span>
            <span className="lose-stat-label">Clicks</span>
          </div>
        </div>

        <button className="lose-btn lose-btn--lobby" onClick={() => { window.location.href = "/"; }}>
          Return to Lobby
        </button>
      </div>
    </div>
  );
}
