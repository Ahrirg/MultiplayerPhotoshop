import LandingPage from './Landingpage';
import './Landingpage.css';

export default function App() {
  const handlePlay = (username: string, session_id: string) => {
    window.location.href = `${window.location.origin}/game?username=${username}&session_id=${session_id}`;
  };

  return <LandingPage onPlay={handlePlay} />;
}