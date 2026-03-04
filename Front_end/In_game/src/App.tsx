import {TopBar} from './Topbar';
import {RightBar} from './RightBar';
import {LeftBar} from './Leftbar';
import {BottomBar} from './BottomBar';
import {Canvas} from './Canvas';

function App() {
  return (
    <>
      <div className="container">
        <TopBar />
        <div className="middle">
          <LeftBar />
          <Canvas />
          <RightBar />
      </div>
        <BottomBar />
    </div>
    </>
  )
}

export default App
