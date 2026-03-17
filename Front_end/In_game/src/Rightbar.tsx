import {Layers} from "./Components/Layers";
import {Chat} from "./Components/Chat";


export function RightBar() {
  return (
    <div className="rightBar">
      <div className="layers">
        <Layers />
      </div>

      <div className="chat">
        <Chat sessionIp="T" />
      </div>
    </div>
  );
}