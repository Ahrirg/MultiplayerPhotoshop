import { useEffect, useState } from "react";
import axios from "axios";
import './App.css'

interface serverData {
    session_id: string,
    host: string,
    port: number,
    expires_at: number,
}

interface loginProps {
  onPlay: (username: string, session_id: string) => void;
}
export function Login_overlay({onPlay} : loginProps) {
    // const [error, setError] = useState<string>("");
    
    const [name, setName] = useState("");
    const [activeServers, setActiveServers] = useState<serverData[]>([]);
    const mainServerIp = `${window.location.protocol}//${window.location.hostname}:8000`;


    const getServers = async () => {
        const result = await axios.get(`${mainServerIp}/sessions`)
        setActiveServers(result.data as serverData[])
    }


    const sendCreateSignal = async () => {
        const result = await axios.post(`${mainServerIp}/session/create`)
        console.log(result.data);
        await getServers();
    }

    useEffect((() => {
        getServers();
    }), [mainServerIp])

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

            <br/>
                <br/>
            <div>
                {activeServers.map((element) => {
                    return (<div>
                        {element.session_id}
                        <button onClick={() => {
                            onPlay(name, element.session_id)
                        }}>
                            Join Server    
                        </button>    
                    </div>
                    )
                })}
            </div>

            <br/>

            <div className="buttons">
            {/* <button onClick={handleJoin}>Join</button> */}
                {/* <button onClick={() => {
                    getServers()
                }}>getServers</button> */}

                <button onClick={() => {
                    sendCreateSignal()
                }}>Create Server</button>
            </div>
        </div>
        </div>
    );
}