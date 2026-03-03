import {TopBar} from './Topbar';
import {RightBar} from './RightBar';
import {LeftBar} from './Leftbar';
import {BottomBar} from './BottomBar';

function App() {
  return (
    <>
      <div className="container">
        <TopBar />
        <div className="middle">
          <LeftBar />
          <RightBar />
      </div>
        <BottomBar />
    </div>
    </>
  )
}

export default App
