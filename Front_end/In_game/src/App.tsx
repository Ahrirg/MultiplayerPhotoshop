import { useEffect, useRef, useState } from "react";
import {TopBar} from './Topbar';
import {RightBar} from './Rightbar';
import {LeftBar} from './Leftbar';
import {BottomBar} from './BottomBar';
import {Canvas} from './Canvas';
import {Login_overlay} from './Login';
import { MouseLayer } from "./Components/MouseLayer";
import { Waiting } from "./Waiting";
import { ImageDropOverlay } from "./Components/ImageDrag";
import { ImageStorage } from "./utils/imageStorage";
import { RoleRevealOverlay } from "./RoleReveal";
import { RoleInfo } from "./Components/Roles";
import { createTextureFromArrayBuffer } from "../../Canvas/renderer";
import { glContext } from "../../Canvas/game_loop";
import { imageCache } from "../../Canvas/objects";
// import "./Css/App.css";

function App() {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [serverIp, setServerIp] = useState<string>("");
  const [seenPlayer, setSeenPlayer] = useState<string[]>([]);
  const imageManagerRef = useRef<ImageStorage | null>(null);
  const mainServerIp = `${window.location.protocol}//${window.location.hostname}:8000`;
  const [userRole, setUserRole] = useState<RoleInfo | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const usernameParam = params.get("username");
    const sessionParam = params.get("session_id");

    if (usernameParam) {
      setUsername(usernameParam);
    }

    if (sessionParam) {
      const fetchSessionIp = async () => {
        try {
          const response = await fetch(`${mainServerIp}/join/${sessionParam}`);
          const data = await response.json();

          console.log("We got")
          console.log(data)
          let ip = data["Server ip"];

          if (ip == "None") {
            const ipt = window.location.hostname.split(":")[0];
            ip = `http://${ipt}:3000`;
          }

          setServerIp(ip);
        } catch (err) {
          console.error("Failed to fetch session IP", err);
        }
      };

      fetchSessionIp();
    }
  }, [mainServerIp]);
  const hasParams = new URLSearchParams(window.location.search).has("session_id");
  return (
    <>
      {!hasParams && (
        <Login_overlay
          setUsername={setUsername}
          setSessionIp={setServerIp}
          mainServerIp={mainServerIp}
        />
      )}

      <Waiting
        sessionIp={serverIp}
        seenPlayers={seenPlayer}
        userRole={userRole}
        setUserRole={setUserRole}
      />
      
      {userRole ? (
        <RoleRevealOverlay
          role={userRole}
          onConfirm={() => console.log("User understood their role")}
        />
      ) : (<></>)}

      <ImageDropOverlay
        src="./assets/dragDrop.png"
        sessionIp={serverIp}
        onDropFile={async (file: File) => {
          console.log("Dropped:", file);
          if (!imageManagerRef.current) {
            imageManagerRef.current = new ImageStorage(
              serverIp,
              username,
              (image) => {}
            );
          }
          const arrbuf = await file.arrayBuffer();
          const bitmap = await createImageBitmap(file);

          const hash = await imageManagerRef.current!.uploadImage(arrbuf);

          // adding texture to user's own cache
          createTextureFromArrayBuffer(glContext, arrbuf)
            .then(texture => {
              imageCache.set(hash, texture);
            });

          CreateAndSendImageObject(
              hash,
              bitmap.width,
              bitmap.height
          );
        }}
      />

      <MouseLayer
        username={username}
        sessionIp={serverIp}
        seenPlayers={seenPlayer}
        setSeenPlayer={setSeenPlayer}
      />

      <div className="container">
        <TopBar sessionIp={serverIp} currentTool={selectedTool} username={username} imageStorage={imageManagerRef.current}/>
        
        <div className="middle">
          <LeftBar 
            activeTool={selectedTool} 
            setActiveTool={setSelectedTool} 
          />
          <Canvas serverIP={serverIp}/>
          <RightBar 
            username={username}
            sessionIp={serverIp}
          />
        </div>
        <BottomBar />
      </div>
    </>
  );
}

export default App;