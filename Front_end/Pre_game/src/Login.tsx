import { useEffect, useRef, useState } from "react";
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
  onClose?: () => void;
  closing?: boolean;
}
export function Login_overlay({onPlay, onClose, closing} : loginProps) {
    // const [error, setError] = useState<string>("");

    const [name, setName] = useState("");
    const [activeServers, setActiveServers] = useState<serverData[]>([]);
    const [newIds, setNewIds] = useState<Set<string>>(new Set());
    const seenIds = useRef<Set<string>>(new Set());
    const doneIds = useRef<Set<string>>(new Set());
    const mainServerIp = `${window.location.protocol}//${window.location.hostname}:8000`;

    const getServers = async () => {
        const result = await axios.get(`${mainServerIp}/sessions`);
        const servers = result.data as serverData[];

        const fresh = new Set<string>();
        servers.forEach(s => {
            if (!seenIds.current.has(s.session_id)) {
                fresh.add(s.session_id);
                seenIds.current.add(s.session_id);
            }
        });

        if (fresh.size > 0) {
            setNewIds(prev => new Set([...prev, ...fresh]));
            setTimeout(() => {
                setNewIds(prev => {
                    const next = new Set(prev);
                    fresh.forEach(id => { next.delete(id); doneIds.current.add(id); });
                    return next;
                });
            }, 600);
        }

        setActiveServers(servers);
    }


    const sendCreateSignal = async () => {
        const result = await axios.post(`${mainServerIp}/session/create`)
        console.log(result.data);
        await getServers();
    }

    useEffect(() => {
        getServers();
        const interval = setInterval(getServers, 1000);
        return () => clearInterval(interval);
    }, [mainServerIp])

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [])

    return (
        <div className={`overlay ${closing ? 'overlay--closing' : ''}`}>
        <div className={`modal ${closing ? 'modal--closing' : ''}`}>
            <button className="modal-close" onClick={onClose}>✕</button>
            <h2>Enter Server Info</h2>

            {/* {error !== "" && <div className="error">{error}</div>} */}
            <input
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <div className="server-list-wrapper">
                <div className="server-list">
                    {activeServers.map((element, i) => {
                        const isNew = newIds.has(element.session_id);
                        const isDone = doneIds.current.has(element.session_id);
                        const animClass = isDone ? '' : isNew ? 'server-row--new' : 'server-row--enter';
                        const delay = isDone || isNew ? '0ms' : `${i * 50}ms`;
                        return (
                        <div
                            className={`server-row ${animClass}`}
                            key={element.session_id}
                            style={{ animationDelay: delay }}
                        >
                            <span className="server-id">{element.session_id}</span>
                            <button onClick={() => onPlay(name, element.session_id)}>
                                Join Server
                            </button>
                        </div>
                        );
                    })}
                </div>
                {activeServers.length > 3 && <div className="server-list-fade" />}
            </div>

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
