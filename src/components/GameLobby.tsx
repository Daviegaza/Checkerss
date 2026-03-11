import React, { useState } from 'react';
import { DifficultyLevel, LEVEL_CONFIGS, PointsState } from '../types/game.types';
import { useWindowSize } from '../hooks/useWindowSize';

interface GameLobbyProps {
  points: PointsState;
  onStartGame: (level: DifficultyLevel) => void;
  onResetPoints: () => void;
}

const StatBox = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ color, fontSize: 22,  fontWeight: 700 }}>{value}</div>
    <div style={{ color: '#6a4030', fontSize: 10,  marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
  </div>
);

const GameLobby: React.FC<GameLobbyProps> = ({ points, onStartGame, onResetPoints }) => {
  const [hovered, setHovered] = useState<DifficultyLevel | null>(null);
  const { isMobile, isTablet } = useWindowSize();
  const levels = Object.values(LEVEL_CONFIGS);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 25% 15%, #1a0800 0%, #0d0906 55%, #050403 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: isMobile ? '28px 16px 40px' : '40px 20px',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 40 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.5em', color: '#8a4a10',  marginBottom: 12 }}>
          ── ◈ ──
        </div>
        <h1 style={{
          fontSize: isMobile ? 46 : 'clamp(48px, 9vw, 80px)',
          fontWeight: 900,
          margin: 0,
          letterSpacing: '0.08em',
          background: 'linear-gradient(180deg, #ff8844 0%, #e05020 40%, #901808 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          filter: 'drop-shadow(0 4px 20px rgba(220,80,20,0.35))',
        }}>
          CHECKERS
        </h1>
        <p style={{
          color: '#7a4a28',
          fontSize: isMobile ? 12 : 15,
          letterSpacing: '0.25em',
          marginTop: 10,

          fontStyle: 'italic',
        }}>
          Checkers · Wager · Dominate
        </p>
      </div>

      {/* Points Dashboard */}
      <div style={{
        background: 'linear-gradient(135deg, #180e06 0%, #0e0804 100%)',
        border: '1px solid #3a1e08',
        borderRadius: 14,
        padding: isMobile ? '16px 20px' : '20px 40px',
        marginBottom: isMobile ? 20 : 36,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 16 : 40,
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(180,80,20,0.1)',
        width: '100%',
        maxWidth: isMobile ? '100%' : 540,
        boxSizing: 'border-box',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: points.balance <= 8 ? '#f87171' : '#e05020',
            fontSize: isMobile ? 48 : 56,
          
            fontWeight: 900,
            lineHeight: 1,
          }}>
            {points.balance}
          </div>
          <div style={{ color: '#6a3818', fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Point Balance
          </div>
        </div>
        <div style={{ width: isMobile ? '80%' : 1, height: isMobile ? 1 : 44, background: '#2a1208' }} />
        <div style={{ display: 'flex', gap: isMobile ? 36 : 28 }}>
          <StatBox label="Wins"   value={points.totalWins}   color="#4ade80" />
          <StatBox label="Losses" value={points.totalLosses} color="#f87171" />
          <StatBox label="Draws"  value={points.totalDraws}  color="#facc15" />
        </div>
      </div>

      {/* Level Cards */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
        width: '100%',
        maxWidth: isMobile ? '100%' : isTablet ? 560 : 576,
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        {levels.map(cfg => {
          const canPlay = points.balance > cfg.cost;
          const isH = hovered === cfg.level;

          return (
            <div
              key={cfg.level}
              onClick={() => canPlay && onStartGame(cfg.level)}
              onMouseEnter={() => setHovered(cfg.level)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: isMobile ? '100%' : isTablet ? 'calc(50% - 6px)' : 280,
                background: isH && canPlay ? cfg.gradient : 'linear-gradient(135deg, #110a04 0%, #0a0603 100%)',
                border: `1px solid ${isH && canPlay ? cfg.color + '55' : '#2a1208'}`,
                borderRadius: 12,
                padding: isMobile ? '18px 16px' : '22px',
                cursor: canPlay ? 'pointer' : 'not-allowed',
                opacity: canPlay ? 1 : 0.4,
                transition: 'all 0.2s ease',
                transform: isH && canPlay && !isMobile ? 'translateY(-3px)' : 'none',
                boxShadow: isH && canPlay ? `0 10px 36px rgba(0,0,0,0.65), 0 0 24px ${cfg.color}18` : '0 4px 16px rgba(0,0,0,0.5)',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ color: cfg.color, fontSize: isMobile ? 15 : 17, fontWeight: 900, letterSpacing: '0.2em' }}>
                  {cfg.label}
                </div>
                {!canPlay && (
                  <span style={{ fontSize: 9, color: '#f87171', letterSpacing: '0.08em' }}>NEED MORE</span>
                )}
              </div>

              <p style={{ color: '#8a5830', fontSize: 12, lineHeight: 1.55, marginBottom: 16, fontStyle: 'italic' }}>
                {cfg.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 18 }}>
                  <div>
                    <span style={{ color: '#5a3a18', fontSize: 9, letterSpacing: '0.1em' }}>WAGER</span>
                    <div style={{ color: '#f87171', fontSize: 16, fontWeight: 700 }}>{cfg.cost} pts</div>
                  </div>
                  <div>
                    <span style={{ color: '#5a3a18', fontSize: 9, letterSpacing: '0.1em' }}>WIN</span>
                    <div style={{ color: '#4ade80', fontSize: 16, fontWeight: 700 }}>+{cfg.reward} pts</div>
                  </div>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${cfg.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: cfg.color }}>
                  ◉
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules */}
      <p style={{ maxWidth: 480, textAlign: 'center', color: '#4a2a12', fontSize: 12, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic', padding: '0 8px' }}>
        Wager points to enter a level. Win = reclaim wager + earn reward. Draw = wager returned. Lose = wager forfeited. Balance must exceed wager.
      </p>

      {points.balance < 2 && (
        <button
          onClick={onResetPoints}
          style={{
            background: 'rgba(200,80,20,0.12)', border: '1px solid rgba(200,80,20,0.3)',
            borderRadius: 8, color: '#e05020',
            fontSize: 12, letterSpacing: '0.1em', padding: '12px 28px', cursor: 'pointer',
          }}
        >
          Reset Points to 20
        </button>
      )}
    </div>
  );
};

export default GameLobby;
