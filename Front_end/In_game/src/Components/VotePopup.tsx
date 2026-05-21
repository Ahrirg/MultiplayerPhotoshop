import { useState, useEffect } from "react";
import axios from "axios";
import "../Css/Vote.css";

interface VotePopupProps {
  players: string[];
  username: string;
  sessionIp: string;
  onClose: () => void;
  closing: boolean;
  setIsAlive: (alive: boolean) => void; // New prop added here
}

interface VoteResults {
  [player: string]: number;
}

export function VotePopup({
  players,
  username,
  sessionIp,
  onClose,
  closing,
  setIsAlive,
}: VotePopupProps) {
  const [myVote, setMyVote] = useState<string | null>(null);
  const [results, setResults] = useState<VoteResults>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchResults = async () => {
    try {
      if (sessionIp.includes("127.0.0.1")) {
        const currentHost = window.location.hostname;
        sessionIp = sessionIp.replace("127.0.0.1", currentHost);
      }
      const res = await axios.get(`${sessionIp}/vote/results`);
      const voteData = res.data as VoteResults;
      setResults(voteData);

      // Check if the current user is voted out
      // Strategy: Find who has the highest votes. If it's the current user, set alive to false.
      const highestVotes = Math.max(...Object.values(voteData), 0);

      if (highestVotes > 0 && voteData[username] === highestVotes) {
        setIsAlive(false);
      } else {
        setIsAlive(true);
      }
    } catch {}
  };

  useEffect(() => {
    fetchResults();
    const id = setInterval(fetchResults, 1000);
    return () => clearInterval(id);
  }, [sessionIp, username]); // Added username to dependency array for safety

  const castVote = async (target: string) => {
    if (myVote || submitting) return;
    setSubmitting(true);
    try {
      if (sessionIp.includes("127.0.0.1")) {
        const currentHost = window.location.hostname;
        sessionIp = sessionIp.replace("127.0.0.1", currentHost);
      }
      await axios.post(`${sessionIp}/vote/cast`, { voter: username, target });
      setMyVote(target);
      fetchResults();
    } catch {}
    setSubmitting(false);
  };

  const totalVotes = Object.values(results).reduce((s, v) => s + v, 0);
  const others = players.filter((p) => p !== username);

  return (
    <div className={`vote-overlay ${closing ? "vote-overlay--out" : ""}`}>
      <div className={`vote-modal ${closing ? "vote-modal--out" : ""}`}>
        <div className="vote-header">
          <span className="vote-icon">🗳️</span>
          <h2 className="vote-title">Vote Out a Player</h2>
          <p className="vote-sub">
            {myVote
              ? `You voted for ${myVote}`
              : "Choose who you think is Mafia"}
          </p>
        </div>

        <div className="vote-list">
          {others.length === 0 && (
            <div className="vote-empty">No other players in session</div>
          )}
          {others.map((player) => {
            const votes = results[player] ?? 0;
            const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const isVoted = myVote === player;
            return (
              <div
                key={player}
                className={`vote-row ${isVoted ? "vote-row--voted" : ""} ${myVote && !isVoted ? "vote-row--disabled" : ""}`}
              >
                <div className="vote-row-top">
                  <span className="vote-player-name">{player}</span>
                  <button
                    className={`vote-btn ${isVoted ? "vote-btn--active" : ""}`}
                    disabled={!!myVote || submitting}
                    onClick={() => castVote(player)}
                  >
                    {isVoted ? "✓ Voted" : "Vote"}
                  </button>
                </div>
                <div className="vote-bar-track">
                  <div className="vote-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="vote-count">
                  {votes} vote{votes !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
