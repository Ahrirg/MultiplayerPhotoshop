import { useState } from "react";
import {TopBar} from './Topbar';
import {RightBar} from './Rightbar';
import {LeftBar} from './Leftbar';
import {BottomBar} from './BottomBar';
import {Canvas} from './Canvas';
import {Login_overlay} from './Login';
import { MouseLayer } from "./Components/MouseLayer";

function App() {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [serverIp, setServerIp] = useState<string>("");

  const mainServerIp = `${window.location.protocol}//${window.location.hostname}:8000`;
  return (
    <>
      <Login_overlay
        setUsername={setUsername}
        setSessionIp={setServerIp}
        mainServerIp={mainServerIp} // HARD CODED AUTH SERVER IP, need to be dynamic prob from the url or something when the game finished or something idk... idc... 
      />

      <MouseLayer
        username={username}
        sessionIp={serverIp}
      />

      <div className="container">
        <TopBar currentTool={selectedTool} />
        
        <div className="middle">
          <LeftBar 
            activeTool={selectedTool} 
            setActiveTool={setSelectedTool} 
          />
          <Canvas />
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