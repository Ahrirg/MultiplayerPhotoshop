import { useEffect, useState } from "react";
import axios from "axios";
import "./Css/Lose.css";

interface LoseScreenProps {
  sessionIp: string;
  username: string;
  show: boolean;
}

interface VoteResults {
  [player: string]: number;
}

export function LoseScreen({ sessionIp, username, show }: LoseScreenProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!show || !sessionIp || !username) return;

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
      } catch {}
    };

    check();
  }, [show, sessionIp, username]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setVisible(false); setClosing(false); }, 350);
  };

  if (!visible) return null;

  return (
    <div className={`lose-overlay ${closing ? 'lose-overlay--out' : ''}`}>
      <div className={`lose-modal ${closing ? 'lose-modal--out' : ''}`}>

        <div className="lose-skulls">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="lose-skull" style={{ animationDelay: `${i * 0.12}s` }}>💀</span>
          ))}
        </div>

        <h1 className="lose-title">You Were Voted Out</h1>
        <p className="lose-sub">The players saw through you, <strong>{username}</strong>.</p>
        <p className="lose-sub muted">Better luck next round.</p>

        <button className="lose-btn" onClick={handleClose}>
          Continue Watching
        </button>
      </div>
    </div>
  );
}
