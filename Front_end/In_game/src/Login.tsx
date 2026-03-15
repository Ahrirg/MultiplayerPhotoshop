import { useState } from "react";
import './App.css'
type LoginOverlayProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setSessionIp: React.Dispatch<React.SetStateAction<string>>;
  mainServerIp: string;
};

export function Login_overlay({ setUsername, setSessionIp, mainServerIp } : LoginOverlayProps) {
  const [showModal, setShowModal] = useState(true);
  const [name, setName] = useState("");
  const [session, setSession] = useState("");

  const handleJoin = () => {
    setUsername(name);
    setSessionIp(session);
    // SHOW ERROR IF NOT WORK

    console.log(name);
    console.log(session);

    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="overlay">
      <div className="modal">
        <h2>Enter Server Info</h2>

        <input
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Server IP"
          value={session}
          onChange={(e) => setSession(e.target.value)}
        />

        <div className="buttons">
          <button onClick={handleJoin}>Join</button>
          <button onClick={() => setShowModal(false)}>SKIP</button>
        </div>
      </div>
    </div>
  );
}