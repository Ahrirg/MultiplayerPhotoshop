import { useState } from "react";
import './Css/App.css'
import './Css/waiting.css'

type LoginOverlayProps = {
  sessionIp: string;
  seenPlayers: string[];
};

export function Waiting({ sessionIp, seenPlayers } : LoginOverlayProps) {
    const [showRoom, setShowRoom] = useState(true);
    if (!showRoom || !sessionIp || sessionIp == "") return null;

    return (
        <div className="overlay">
            <div className="waitingRoom">
                <h2>Current players in the server:</h2>
                <div className="PlayerList">
                    {seenPlayers.map((curName) => {
                        return (<><strong>🟢 {curName}</strong><br/></>)
                    })}
                </div>
                <button onClick={() => {setShowRoom(false)}}>Start game</button>
            </div>
        </div>
    );
}