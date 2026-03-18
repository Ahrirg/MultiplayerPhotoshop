import { useState } from 'react';
import LandingPage from './Landingpage';
import './Landingpage.css';

type Page = 'landing' | 'game';

export default function App() {
  const [page, setPage] = useState<Page>('landing');

  if (page === 'game') {
    window.location.href = `${window.location.origin}/game`;
  }

  return <LandingPage onPlay={() => setPage('game')} />;
}