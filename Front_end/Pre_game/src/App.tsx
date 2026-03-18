import { useEffect, useState } from 'react';
import './App.css';

interface TeamMember {
  name: string;
  role: string;
}

interface SplatProps {
  top?: string;
  left?: string;
  right?: string;
  size: number;
  color: string;
  rotate: number;
}

interface LandingPageProps {
  onPlay: () => void;
}

const TEAM: TeamMember[] = [
  { name: 'Marta K.', role: 'Lead Developer' },
  { name: 'Jonas V.', role: 'Game Designer' },
  { name: 'Lukas P.', role: 'UI / UX' },
];

const SPLATS: SplatProps[] = [
  { top: '8%',  left: '5%',  size: 180, color: '#ff4d6d', rotate: 20  },
  { top: '60%', left: '2%',  size: 120, color: '#4cc9f0', rotate: -15 },
  { top: '15%', right: '4%', size: 150, color: '#f7b731', rotate: 40  },
  { top: '70%', right: '6%', size: 200, color: '#a29bfe', rotate: -30 },
  { top: '40%', left: '45%', size: 80,  color: '#55efc4', rotate: 10  },
];

const GAME_CARDS = [
  { icon: '🖌️', label: 'Draw',  desc: 'One player gets a secret word and has 60 seconds to draw it on the canvas.' },
  { icon: '💡', label: 'Guess', desc: 'Other players race to type the correct answer before time runs out.' },
  { icon: '🏆', label: 'Win',   desc: 'Score points for fast guesses and creative drawings. Most points wins!' },
];

function PaintSplat({ top, left, right, size, color, rotate }: SplatProps) {
  return (
    <svg
      className="splat"
      style={{ top, left, right, width: size, height: size, transform: `rotate(${rotate}deg)` }}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="50" cy="50" rx="38" ry="28" fill={color} opacity="0.18" />
      <ellipse cx="62" cy="38" rx="14" ry="10" fill={color} opacity="0.22" />
      <ellipse cx="30" cy="62" rx="10" ry="7"  fill={color} opacity="0.2"  />
      <ellipse cx="72" cy="60" rx="7"  ry="5"  fill={color} opacity="0.25" />
      <ellipse cx="40" cy="30" rx="6"  ry="4"  fill={color} opacity="0.2"  />
      <circle  cx="80" cy="45" r="4"           fill={color} opacity="0.3"  />
      <circle  cx="22" cy="44" r="3"           fill={color} opacity="0.3"  />
      <circle  cx="55" cy="75" r="5"           fill={color} opacity="0.25" />
    </svg>
  );
}

function PlayButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="lp-play-btn" onClick={onClick}>
      <span className="lp-play-inner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        {label}
      </span>
    </button>
  );
}

export default function LandingPage({ onPlay }: LandingPageProps) {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="lp-root">
      {SPLATS.map((s, i) => <PaintSplat key={i} {...s} />)}

      <section className={`lp-hero ${visible ? 'lp-visible' : ''}`}>
        <div className="lp-brush-line" />
        <p className="lp-eyebrow">A canvas-based multiplayer experience</p>
        <h1 className="lp-title">
          <span className="lp-title-stroke">MULTIPLAYER</span>
          <span className="lp-title-fill">MAFIA</span>
          <span className="lp-title-fill">PHOTOSHOP</span>
        </h1>
        <p className="lp-tagline">Draw fast. Guess faster. Win in colour.</p>
        <PlayButton label="PLAY NOW" onClick={onPlay} />
      </section>

      <section className="lp-section">
        <div className="lp-section-tag">01 — ABOUT THE GAME</div>
        <h2 className="lp-section-title">What is PaintClash?</h2>
        <div className="lp-cards">
          {GAME_CARDS.map(({ icon, label, desc }) => (
            <div className="lp-card" key={label}>
              <span className="lp-card-icon">{icon}</span>
              <h3 className="lp-card-label">{label}</h3>
              <p className="lp-card-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-section-alt">
        <div className="lp-section-tag">02 — THE TEAM</div>
        <h2 className="lp-section-title">Made by</h2>
        <div className="lp-team">
          {TEAM.map(({ name, role }) => (
            <div className="lp-member" key={name}>
              <div className="lp-avatar">
                {name.split(' ').map((w: string) => w[0]).join('')}
              </div>
              <div>
                <p className="lp-member-name">{name}</p>
                <p className="lp-member-role">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-cta">
        <p className="lp-cta-sub">Ready to pick up the brush?</p>
        <PlayButton label="START PLAYING" onClick={onPlay} />
      </section>

      <footer className="lp-footer">© 2025 PaintClash Team — All rights reserved</footer>
    </div>
  );
}