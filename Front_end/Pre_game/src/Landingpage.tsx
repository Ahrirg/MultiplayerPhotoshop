import { useEffect, useState } from 'react';
import './Landingpage.css';

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

const SPLATS: SplatProps[] = [
  { top: '8%',  left: '5%',  size: 180, color: '#ff4d6d', rotate: 20  },
  { top: '60%', left: '2%',  size: 120, color: '#4cc9f0', rotate: -15 },
  { top: '15%', right: '4%', size: 150, color: '#f7b731', rotate: 40  },
  { top: '70%', right: '6%', size: 200, color: '#a29bfe', rotate: -30 },
];

const GAME_CARDS = [
  {
    icon: '🎭',
    label: 'Two Teams',
    desc: 'Players are split into two groups — the innocent Editors and the hidden Mafia. Only the Mafia knows the real topic.',
  },
  {
    icon: '🖼️',
    label: 'Edit & Deceive',
    desc: 'Everyone edits the canvas using Photoshop-style tools. Mafia members try to subtly mislead while blending in with the crowd.',
  },
  {
    icon: '🕵️',
    label: 'Find the Mafia',
    desc: 'After each round, players vote on who they think the Mafia is. Guess right to win — or stay hidden long enough to take over.',
  },
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
        <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        {label}
      </span>
    </button>
  );
}

function PlayButton2({ label, onClick, iconSize = 26, fontSize = '1.6rem' }: { 
  label: string; 
  onClick: () => void; 
  iconSize?: number;
  fontSize?: string;
}) {
  return (
    <button className="lp-play-btn" onClick={onClick}>
      <span className="lp-play-inner" style={{ fontSize }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
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
        <p className="lp-eyebrow">Photoshop based multiplayer experience</p>
        <h1 className="lp-title">
          <span className="lp-title-stroke">MULTIPLAYER</span>
          <span className="lp-title-fill">MAFIA PHOTOSHOP</span>
        </h1>
        <p className="lp-tagline">Edit fast. Guess faster. Dominate even faster.</p>
        <PlayButton label="PLAY NOW" onClick={onPlay} />
      </section>

      {/* ── ABOUT GAME ───────────────────────────── */}
      <section className="lp-section">
        <div className="lp-section-tag">01 — ABOUT THE GAME</div>
        <h2 className="lp-section-title">What is Mafia Photoshop?</h2>
        <p className="lp-section-body">
          Mafia Photoshop is a multiplayer social deduction game played on a shared canvas.
          Players collaborate—and compete—using real image editing tools. Some players are secretly part of the <strong>Mafia</strong> and are given no topic, forcing them to pretend they know what’s going on.
          Can the innocent editors expose them before it’s too late?
        </p>
        <br></br>
        <br></br>
        <br></br>
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

      {/* ── ABOUT TEAM ───────────────────────────── */}
      <section className="lp-section lp-section-alt">
        <div className="lp-section-tag">02 — THE TEAM</div>
        <h2 className="lp-section-title">Made by SkillGapped</h2>
        <p className="lp-section-body">
          We are <strong>SKILLGAPPed</strong> — a student project group from
          <strong> Kaunas University of Technology (KTU)</strong>. This game was built as part
          of our university coursework. We are a small team of developers and designers who
          wanted to push beyond the usual homework assignment and build something actually fun.
        </p>
        <div className="lp-team">
        </div>
      </section>

      <section className="lp-cta">
        <p className="lp-cta-sub">Ready to pick up the brush?</p>
        <PlayButton2 label="START PLAYING" onClick={onPlay} />
      </section>

      <footer className="lp-footer">© 2026 SkillGapped — KTU Student Project — All rights reserved</footer>
    </div>
  );
}