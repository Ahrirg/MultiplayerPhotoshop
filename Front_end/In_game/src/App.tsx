import { useState } from "react";
import {TopBar} from './Topbar';
import {RightBar} from './Rightbar';
import {LeftBar} from './Leftbar';
import {BottomBar} from './BottomBar';
import {Canvas} from './Canvas';
import {Login_overlay} from './Login';

function App() {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [serverIp, setServerIp] = useState<string>("");

  return (
    <>
      <Login_overlay
        setUsername={setUsername}
        setSessionIp={setServerIp}
        mainServerIp="http://127.0.0.1:8000" // HARD CODED AUTH SERVER IP, need to be dynamic prob from the url or something when the game finished or something idk... idc... 
      />

      <div className="container">
        <TopBar currentTool={selectedTool} />
        
        <div className="middle">
          <LeftBar 
            activeTool={selectedTool} 
            setActiveTool={setSelectedTool} 
          />
          <Canvas />
          <RightBar />
        </div>
        <BottomBar />
      </div>
    </>
  );
}

export default App;