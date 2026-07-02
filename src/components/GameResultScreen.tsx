import React, { useEffect, useRef, useState } from 'react';
import { GameResult, JACKPOT_TIERS, LevelConfig, PointsState, SIDE_BETS } from '../types/game.types';
import { useWindowSize } from '../hooks/useWindowSize';
import ChipCounter from './ChipCounter';
import Confetti from './Confetti';

interface GameResultScreenProps {
  result: GameResult;
  config: LevelConfig;
  points: PointsState;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onSfx: (name: 'chipClick' | 'win' | 'lose' | 'draw' | 'jackpot' | 'coin' | 'kingMe') => void;
}

const GameResultScreen: React.FC<GameResultScreenProps> = ({
  result, config, points, onPlayAgain, onBackToLobby, onSfx,
}) => {
  const { isMobile } = useWindowSize();
  const isWin = result.type === 'player_win';
  const isDraw = result.type === 'draw';
  const [displayedGain, setDisplayedGain] = useState(0);
  const playAgainRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (result.jackpotHit) onSfx('jackpot');
    else if (isWin) onSfx('win');
    else if (isDraw) onSfx('draw');
    else onSfx('lose');
    const t = setTimeout(() => setDisplayedGain(result.pointsChange), 240);
    const f = setTimeout(() => { playAgainRef.current?.focus(); }, 400);
    return () => { clearTimeout(t); clearTimeout(f); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = result.jackpotHit ? 'JACKPOT!' : isWin ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT';
  const symbol = result.jackpotHit ? '★' : isWin ? '◎' : isDraw ? '◈' : '●';
  const titleColor = result.jackpotHit ? '#f0c040' : isWin ? '#4ade80' : isDraw ? '#f0c040' : '#f04d5c';
  const bgTint = result.jackpotHit
    ? 'radial-gradient(ellipse at 50% 35%, rgba(240,192,64,0.55) 0%, rgba(120,60,10,0.5) 30%, rgba(30,20,40,0.9) 70%, #0e1a26 100%),' +
      'radial-gradient(ellipse at 15% 90%, rgba(192,124,230,0.25) 0%, transparent 55%)'
    : isWin
      ? 'radial-gradient(ellipse at 50% 35%, rgba(74,222,128,0.4) 0%, rgba(20,80,50,0.4) 30%, rgba(20,40,55,0.9) 70%, #0e1a26 100%),' +
        'radial-gradient(ellipse at 85% 15%, rgba(124,230,255,0.2) 0%, transparent 55%)'
      : isDraw
        ? 'radial-gradient(ellipse at 50% 35%, rgba(240,192,64,0.28) 0%, rgba(60,50,20,0.5) 40%, rgba(20,30,42,0.9) 75%, #0e1a26 100%),' +
          'radial-gradient(ellipse at 10% 90%, rgba(124,230,255,0.15) 0%, transparent 55%)'
        : 'radial-gradient(ellipse at 50% 35%, rgba(240,77,92,0.42) 0%, rgba(90,20,40,0.5) 30%, rgba(30,20,35,0.92) 70%, #0e1a26 100%),' +
          'radial-gradient(ellipse at 85% 90%, rgba(192,124,230,0.18) 0%, transparent 55%)';

  return (
    <div style={{
      minHeight: isMobile ? 'auto' : '100vh',
      background: bgTint,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center',
      padding: isMobile ? '20px 16px calc(130px + var(--kf-safe-bottom))' : '48px 32px',
      boxSizing: 'border-box', color: '#f0e6cf', position: 'relative',
    }}>
      <Confetti active={isWin || result.jackpotHit} intense={result.jackpotHit} />

      <div style={{ textAlign: 'center', width: '100%', maxWidth: 520 }}>
        <div style={{
          fontSize: isMobile ? 82 : 108, marginBottom: 6, color: titleColor,
          filter: `drop-shadow(0 0 32px ${titleColor}88)`,
          animation: 'trophyPop 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>{symbol}</div>

        <h1 style={{
          fontSize: isMobile ? 44 : 60, fontWeight: 900, color: titleColor,
          margin: '0 0 6px', letterSpacing: '0.14em',
          fontFamily: "'Playfair Display', serif",
          filter: `drop-shadow(0 0 30px ${titleColor}55)`,
        }}>{title}</h1>

        <p style={{
          color: '#8a7a4a', fontSize: 12, letterSpacing: '0.2em',
          marginBottom: 26, fontStyle: 'italic', fontFamily: "'Cinzel', serif",
        }}>{config.label} TABLE</p>

        {result.jackpotHit && result.jackpotTierHit && (() => {
          const tdef = JACKPOT_TIERS[result.jackpotTierHit];
          return (
            <div style={{
              background: `linear-gradient(135deg, ${tdef.color}55, ${tdef.color}22)`,
              border: `1px solid ${tdef.color}`,
              borderRadius: 14, padding: '14px 20px', marginBottom: 20,
              boxShadow: `0 0 40px ${tdef.color}66`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', color: tdef.color, fontFamily: "'Cinzel', serif" }}>
                {tdef.label} JACKPOT HIT
              </div>
              <ChipCounter value={result.jackpotAmount} color={tdef.color} size={40} prefix="+" />
            </div>
          );
        })()}

        <div style={{
          background: 'linear-gradient(135deg, rgba(20,25,22,0.9) 0%, rgba(10,12,10,0.9) 100%)',
          border: '1px solid rgba(240,192,64,0.2)',
          borderRadius: 16, padding: isMobile ? '18px' : '22px 32px',
          marginBottom: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(240,192,64,0.1)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#8a7a4a', letterSpacing: '0.25em', fontFamily: "'Cinzel', serif" }}>
              NET FOR THE ROUND
            </div>
            <ChipCounter
              value={displayedGain}
              color={result.pointsChange > 0 ? '#4ade80' : result.pointsChange < 0 ? '#f04d5c' : '#f0c040'}
              size={isMobile ? 46 : 60}
              prefix={result.pointsChange > 0 ? '+' : ''}
              duration={1400}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 8, marginTop: 8,
          }}>
            {result.basePayout > 0 && (
              <BreakdownRow label={isWin ? 'Base payout' : 'Stake returned'} value={`+${result.basePayout}`} color="#c8d0e0" />
            )}
            {result.streakBonus > 0 && (
              <BreakdownRow label="Streak bonus" value={`+${result.streakBonus}`} color="#f0c040" />
            )}
            {result.jackpotAmount > 0 && (
              <BreakdownRow label="Jackpot" value={`+${result.jackpotAmount}`} color="#f0c040" />
            )}
            {!isWin && !isDraw && (
              <BreakdownRow label="Stake lost" value={`-${config.cost}`} color="#f04d5c" />
            )}
            {result.sideBetOutcomes.map(sbo => (
              <BreakdownRow
                key={sbo.id}
                label={`Side · ${SIDE_BETS[sbo.id].label}`}
                value={sbo.won ? `+${sbo.payout - sbo.stake}` : `-${sbo.stake}`}
                color={sbo.won ? '#4ade80' : '#f04d5c'}
              />
            ))}
            <BreakdownRow label="VIP XP earned" value={`+${result.vipXpGained}`} color="#c8d0e0" />
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-around',
          gap: 8, marginBottom: 22, flexWrap: 'wrap',
        }}>
          <BalanceTile label="Chip Balance" value={points.balance} color="#f0c040" />
          {points.winStreak > 0 && <BalanceTile label="Win Streak" value={points.winStreak} color="#f04d5c" icon="🔥" />}
          <BalanceTile label="Jackpot Pot" value={points.jackpot} color="#ff8ea0" />
        </div>

        {result.newAchievements.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(240,192,64,0.15), rgba(122,90,16,0.1))',
            border: '1px solid rgba(240,192,64,0.5)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 22,
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#f0c040', fontFamily: "'Cinzel', serif", marginBottom: 6 }}>
              ACHIEVEMENT{result.newAchievements.length > 1 ? 'S' : ''} UNLOCKED
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {result.newAchievements.map(a => (
                <div key={a.id} style={{
                  display: 'flex', gap: 8, alignItems: 'center',
                  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(240,192,64,0.35)',
                  borderRadius: 8, padding: '6px 12px',
                }}>
                  <span style={{ fontSize: 18, color: '#f0c040' }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#f0c040', fontFamily: "'Cinzel', serif" }}>{a.label}</div>
                    <div style={{ fontSize: 9, color: '#8a7a4a' }}>+{a.reward} chips reward</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          gap: 12, justifyContent: 'center',
        }}>
          <button
            ref={playAgainRef}
            className="kf-tap"
            onClick={() => { onSfx('chipClick'); onPlayAgain(); }}
            style={{
              background: config.gradient,
              border: `1px solid ${config.color}80`,
              borderRadius: 10, color: '#fff',
              fontSize: 12, letterSpacing: '0.2em',
              padding: isMobile ? '14px' : '13px 30px',
              cursor: 'pointer', textTransform: 'uppercase',
              width: isMobile ? '100%' : 'auto',
              fontFamily: "'Cinzel', serif", fontWeight: 700,
              boxShadow: `0 6px 20px ${config.glow}`,
            }}
          >Rematch · {config.cost} chips</button>
          <button
            className="kf-tap"
            onClick={() => { onSfx('chipClick'); onBackToLobby(); }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(240,192,64,0.3)',
              borderRadius: 10, color: '#c8b078',
              fontSize: 12, letterSpacing: '0.2em',
              padding: isMobile ? '14px' : '13px 30px',
              cursor: 'pointer', textTransform: 'uppercase',
              width: isMobile ? '100%' : 'auto',
              fontFamily: "'Cinzel', serif", fontWeight: 700,
            }}
          >Back to Floor</button>
        </div>
      </div>

      <style>{`
        @keyframes trophyPop {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const BreakdownRow: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    padding: '5px 10px',
    background: 'rgba(0,0,0,0.35)',
    borderRadius: 6, fontSize: 12,
  }}>
    <span style={{ color: '#8a7a4a' }}>{label}</span>
    <span style={{ color, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{value}</span>
  </div>
);

const BalanceTile: React.FC<{ label: string; value: number; color: string; icon?: string }> = ({ label, value, color, icon }) => (
  <div style={{ textAlign: 'center', minWidth: 90 }}>
    <div style={{ fontSize: 22, color, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
      {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
      {value.toLocaleString()}
    </div>
    <div style={{ fontSize: 9, color: '#6a5a3a', letterSpacing: '0.15em', fontFamily: "'Cinzel', serif" }}>
      {label.toUpperCase()}
    </div>
  </div>
);

export default GameResultScreen;
