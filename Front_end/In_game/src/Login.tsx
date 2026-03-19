import { useState } from "react";
import axios from "axios";
import './App.css'

type LoginOverlayProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setSessionIp: React.Dispatch<React.SetStateAction<string>>;
  mainServerIp: string;
};

export function Login_overlay({ setUsername, setSessionIp, mainServerIp } : LoginOverlayProps) {
    const [error, setError] = useState<string>("");
    
    const [showModal, setShowModal] = useState(true);
    const [name, setName] = useState("");
    const [session, setSession] = useState("");
    
    
    async function getIp(): Promise<string | null> {
        try {
            const response = await axios.get(`${mainServerIp}/join/${session}`);
            return response.data["Server ip"]
        }catch {
            return null;
        }
    }

    const handleJoin = async () => {
        let ip = await getIp();
        if (ip) {
            if (ip.includes("localhost")) {
                const ipt = window.location.hostname.split(":")[0];

                ip = `http://${ipt}:3000`;
            }
            setUsername(name);
            setSessionIp(ip);

            console.log(name);
            console.log(ip);

            setShowModal(false);
        } else{
            console.error(`Server not found with id'${session}'`)
            setError(`Server not found with id'${session}'`);
        }
    };

    if (!showModal) return null;

    return (
        <div className="overlay">
        <div className="modal">
            <h2>Enter Server Info</h2>

            {error !== "" && <div className="error">{error}</div>}
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