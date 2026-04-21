import { useState } from "react";
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
import { CreateAndSendImageObject } from "../../Canvas/input_handling";
// import "./Css/App.css";

function App() {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [serverIp, setServerIp] = useState<string>("");
  const [seenPlayer, setSeenPlayer] = useState<string[]>([]);
  const [imageManager, setImageManager] = useState<ImageStorage | null>(null);

  const mainServerIp = `${window.location.protocol}//${window.location.hostname}:8000`;
  return (
    <>
      <Login_overlay
        setUsername={setUsername}
        setSessionIp={setServerIp}
        mainServerIp={mainServerIp} // HARD CODED AUTH SERVER IP, need to be dynamic prob from the url or something when the game finished or something idk... idc... 
      />

      <Waiting
        sessionIp={serverIp}
        seenPlayers={seenPlayer}
      />

      <ImageDropOverlay
        src="./assets/dragDrop.png"
        sessionIp={serverIp}
        onDropFile={async (file: File) => {
          console.log("Dropped:", file);
          if (!imageManager){
            setImageManager(new ImageStorage(serverIp, username, (image) => {}));
          }
          const arrbuf = await file.arrayBuffer();
          const bitmap = await createImageBitmap(file);

          const hash = await imageManager?.uploadImage(arrbuf)!;

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
        <TopBar currentTool={selectedTool} username={username} imageStorage={imageManager}/>
        
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