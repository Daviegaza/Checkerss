import React from 'react';
import { GameResult, LevelConfig, PointsState } from '../types/game.types';
import { useWindowSize } from '../hooks/useWindowSize';

interface GameResultScreenProps {
  result: GameResult;
  config: LevelConfig;
  points: PointsState;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

const GameResultScreen: React.FC<GameResultScreenProps> = ({
  result, config, points, onPlayAgain, onBackToLobby,
}) => {
  const { isMobile } = useWindowSize();
  const isWin  = result.type === 'player_win';
  const isDraw = result.type === 'draw';
  const title  = isWin ? 'Victory!' : isDraw ? 'Draw' : 'Defeat';
  const symbol = isWin ? '◎' : isDraw ? '◈' : '●';
  const titleColor  = isWin ? '#4ade80' : isDraw ? '#facc15' : '#f87171';
  const pointsColor = result.pointsChange > 0 ? '#4ade80' : result.pointsChange < 0 ? '#f87171' : '#facc15';
  const pointsLabel = result.pointsChange > 0 ? `+${result.pointsChange}` : `${result.pointsChange}`;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 25% 15%, #1a0800 0%, #0d0906 55%, #050403 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '32px 20px' : '40px',
      boxSizing: 'border-box',
    }}>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 420 }}>

        <div style={{ fontSize: isMobile ? 72 : 88, marginBottom: 14, color: titleColor, filter: `drop-shadow(0 0 24px ${titleColor}55)` }}>
          {symbol}
        </div>

        <h1 style={{
          fontSize: isMobile ? 50 : 64,
          fontWeight: 900,
          color: titleColor,
          margin: '0 0 8px',
          letterSpacing: '0.06em',
          filter: `drop-shadow(0 0 30px ${titleColor}40)`,
        }}>
          {title}
        </h1>

        <p style={{
          color: '#8a5030', fontSize: isMobile ? 12 : 13,
          letterSpacing: '0.1em', marginBottom: 36, fontStyle: 'italic', padding: '0 8px',
        }}>
          {result.reason}
        </p>

        {/* Points card */}
        <div style={{
          background: 'linear-gradient(135deg, #180e06 0%, #0e0804 100%)',
          border: '1px solid #3a1e08',
          borderRadius: 14,
          padding: isMobile ? '20px' : '24px 40px',
          marginBottom: 28,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 16 : 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: pointsColor, fontSize: isMobile ? 44 : 52, fontWeight: 900, lineHeight: 1 }}>
              {pointsLabel}
            </div>
            <div style={{ color: '#6a3818', fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Points {result.pointsChange >= 0 ? 'Earned' : 'Lost'}
            </div>
          </div>
          <div style={{ width: isMobile ? '60%' : 1, height: isMobile ? 1 : 44, background: '#2a1208' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: points.balance <= 4 ? '#f87171' : '#e05020', fontSize: isMobile ? 44 : 52, fontWeight: 900, lineHeight: 1 }}>
              {points.balance}
            </div>
            <div style={{ color: '#6a3818', fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              New Balance
            </div>
          </div>
        </div>

        <p style={{ color: '#5a3818', fontSize: 13, marginBottom: 28, fontStyle: 'italic' }}>
          Played on <span style={{ color: config.color }}>{config.label}</span> difficulty
        </p>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12, justifyContent: 'center',
        }}>
          <button
            onClick={onPlayAgain}
            style={{
              background: config.gradient, border: `1px solid ${config.color}50`,
              borderRadius: 8, color: '#fff',
              fontSize: 12, letterSpacing: '0.15em', padding: isMobile ? '14px' : '12px 28px',
              cursor: 'pointer', textTransform: 'uppercase', width: isMobile ? '100%' : 'auto',
            }}
          >
            Play Again
          </button>
          <button
            onClick={onBackToLobby}
            style={{
              background: 'transparent', border: '1px solid #3a1e08',
              borderRadius: 8, color: '#8a5030',
              fontSize: 12, letterSpacing: '0.15em', padding: isMobile ? '14px' : '12px 28px',
              cursor: 'pointer', textTransform: 'uppercase', width: isMobile ? '100%' : 'auto',
            }}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResultScreen;
