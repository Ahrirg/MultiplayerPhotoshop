import { useEffect, useState } from "react";
import './Css/App.css'
import './Css/waiting.css'
import axios from "axios";
import { ROLES } from "./Components/Roles";
import type { RoleInfo } from "./Components/Roles";

type LoginOverlayProps = {
  sessionIp: string;
  seenPlayers: string[];
  userRole: RoleInfo | null,
  setUserRole: React.Dispatch<React.SetStateAction<RoleInfo | null>>;
};

interface StatusData {
  up: string;
  status: string;
  game_start: string;
  game_end: string;
}

export function Waiting({ sessionIp, seenPlayers, userRole, setUserRole  }: LoginOverlayProps) {
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
        const result = await axios.get(`${sessionIp}/status`);
        const data = result.data as StatusData;
        console.log(data)

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

  const secondsLeft = Math.max(0, Math.floor((timeToStart - currentTime) / 1000));
  console.log(secondsLeft)
  if (timeToStart > 0 && secondsLeft <= 0) {
    if (!userRole) {
        setUserRole(getRandomRole());
    }
    setShowRoom(false);
  }

  return (
    <div className="overlay">
      <div className="waitingRoom">
        <h2>Current players in the server:</h2>

        <div className="PlayerList">
          {seenPlayers.map((curName, index) => (
            <div key={index}>
              <strong>🟢 {curName}</strong>
            </div>
          ))}
        </div>

        <div>Starting in {secondsLeft} sec's</div>
      </div>
    </div>
  );
}