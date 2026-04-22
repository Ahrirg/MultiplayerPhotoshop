import { useState } from "react";
import axios from "axios";
import './App.css'

export function Login_overlay() {
    // const [error, setError] = useState<string>("");
    
    const [name, setName] = useState("");
    const [session, setSession] = useState("");
    const [activeServers, setActiveServers] = useState("");
    const mainServerIp = `${window.location.protocol}//${window.location.hostname}:8000`;


    const getServers = async () => {
        const result = await axios.get(`${mainServerIp}/sessions`)
        console.log(result.data);
    }


    const sendCreateSignal = async () => {
        const result = await axios.post(`${mainServerIp}/session/create`)
        console.log(result.data);
    }


    return (
        <div className="overlay">
        <div className="modal">
            <h2>Enter Server Info</h2>

            {/* {error !== "" && <div className="error">{error}</div>} */}
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
            {/* <button onClick={handleJoin}>Join</button> */}
            <button onClick={() => {
                getServers()
            }}>getServers</button>

            <button onClick={() => {
                sendCreateSignal()
            }}>Create Server</button>
            </div>
        </div>
        </div>
    );
}