import {Layers} from "./Components/Layers";
import {Chat} from "./Components/Chat";

type sessionData = {
  username: string;
  sessionIp: string;
};

export function RightBar({ username, sessionIp } : sessionData) {
  return (
    <div className="rightBar">
      <div className="layers">
        <Layers />
      </div>

      <div className="chat">
        <Chat
          username={username}
          sessionIp={sessionIp}
        />
      </div>
    </div>
  );
}