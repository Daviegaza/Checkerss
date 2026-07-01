import React, { useMemo, useState } from 'react';
import {
  ACHIEVEMENTS,
  ChipSkinId,
  CHIP_SKINS,
  CHIP_SKIN_ORDER,
  DifficultyLevel,
  JACKPOT_TIERS,
  JACKPOT_TIER_ORDER,
  LEVEL_CONFIGS,
  LevelConfig,
  MissionsState,
  nextVipTier,
  PointsState,
  SIDE_BETS,
  SideBetId,
  streakMultiplier,
  vipTierFor,
  VIP_TIERS,
} from '../types/game.types';
import { useWindowSize } from '../hooks/useWindowSize';
import ChipCounter from './ChipCounter';
import MissionBoard from './MissionBoard';
import { DailyBonusStatus } from '../hooks/usePoints';

interface GameLobbyProps {
  points: PointsState;
  dailyBonus: DailyBonusStatus;
  muted: boolean;
  ambientOn: boolean;
  onClaimDailyBonus: () => void;
  onStartGame: (level: DifficultyLevel, sideBets: SideBetId[]) => void;
  onResetPoints: () => void;
  onToggleMute: () => void;
  onToggleAmbient: () => void;
  onSfx: (name: 'chipClick' | 'coin' | 'error' | 'missionComplete' | 'skinUnlock' | 'hover') => void;
  missions: MissionsState;
  onClaimMission: (templateId: string) => void;
  activeSkin: ChipSkinId;
  unlockedSkins: ChipSkinId[];
  onEquipSkin: (id: ChipSkinId) => void;
  sessionLabel: string;
}

function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

const GameLobby: React.FC<GameLobbyProps> = ({
  points, dailyBonus, muted, ambientOn,
  onClaimDailyBonus, onStartGame, onResetPoints, onToggleMute, onToggleAmbient, onSfx,
  missions, onClaimMission,
  activeSkin, unlockedSkins, onEquipSkin,
  sessionLabel,
}) => {
  const { isMobile, isTablet } = useWindowSize();
  const [hovered, setHovered] = useState<DifficultyLevel | null>(null);
  const [activeSideBets, setActiveSideBets] = useState<Set<SideBetId>>(new Set());

  const tier = vipTierFor(points.vipXp);
  const nextTier = nextVipTier(points.vipXp);
  const nextMult = streakMultiplier(points.winStreak + 1);
  const currentMult = streakMultiplier(points.winStreak);
  const levels = Object.values(LEVEL_CONFIGS);
  const sideBetsTotal = useMemo(
    () => [...activeSideBets].reduce((s, id) => s + SIDE_BETS[id].cost, 0),
    [activeSideBets]
  );

  const toggleSideBet = (id: SideBetId) => {
    onSfx('chipClick');
    setActiveSideBets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStart = (cfg: LevelConfig) => {
    const total = cfg.cost + sideBetsTotal;
    if (points.balance < total) { onSfx('error'); return; }
    if (tier.tier < cfg.vipRequired) { onSfx('error'); return; }
    onSfx('chipClick');
    onStartGame(cfg.level, [...activeSideBets]);
  };

  const bgFelt =
    'radial-gradient(ellipse at 50% -10%, rgba(240,192,64,0.28) 0%, transparent 55%),' +
    'radial-gradient(ellipse at 12% 20%, rgba(192,124,230,0.22) 0%, transparent 50%),' +
    'radial-gradient(ellipse at 88% 30%, rgba(124,230,255,0.20) 0%, transparent 50%),' +
    'radial-gradient(ellipse at 20% 95%, rgba(74,222,128,0.16) 0%, transparent 55%),' +
    'radial-gradient(ellipse at 82% 85%, rgba(240,77,92,0.22) 0%, transparent 55%),' +
    'linear-gradient(180deg, #1a3245 0%, #142230 45%, #0e1a26 100%)';

  return (
    <div style={{
      minHeight: '100vh',
      background: bgFelt,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: isMobile ? '20px 14px 40px' : '32px 24px 48px',
      boxSizing: 'border-box',
      color: '#f0e6cf',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 960, marginBottom: isMobile ? 18 : 24,
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#8a7a4a', fontFamily: "'Cinzel', serif" }}>
            HOUSE OF
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 30 : 38,
            fontWeight: 900,
            letterSpacing: '0.06em',
            background: 'linear-gradient(180deg, #fce49a 0%, #f0c040 50%, #7a5a10 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 12px rgba(240,192,64,0.35))',
            lineHeight: 1,
          }}>
            KINGFALL
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div title={`Session ${sessionLabel}`} style={{
            background: 'linear-gradient(135deg, rgba(124,230,255,0.15), rgba(20,60,80,0.5))',
            border: '1px solid rgba(124,230,255,0.35)',
            borderRadius: 999, padding: '6px 12px',
            fontFamily: "'Cinzel', serif", fontSize: 10, color: '#7ce6ff', letterSpacing: '0.15em',
          }}>{sessionLabel}</div>
          <button
            onClick={() => { onSfx('chipClick'); onToggleAmbient(); }}
            title={ambientOn ? 'Ambient off' : 'Ambient on'}
            style={{
              background: ambientOn ? 'linear-gradient(135deg, rgba(192,124,230,0.3), rgba(80,40,120,0.4))' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${ambientOn ? 'rgba(192,124,230,0.6)' : 'rgba(192,124,230,0.25)'}`,
              borderRadius: 10, color: ambientOn ? '#e0b0f0' : '#7a5a90',
              width: 40, height: 40, fontSize: 16, cursor: 'pointer',
              boxShadow: ambientOn ? '0 0 16px rgba(192,124,230,0.35)' : 'none',
            }}
          >≋</button>
          <button
            onClick={() => { onSfx('chipClick'); onToggleMute(); }}
            title={muted ? 'Unmute' : 'Mute'}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(240,192,64,0.25)',
              borderRadius: 10, color: muted ? '#8a7a4a' : '#f0c040',
              width: 40, height: 40, fontSize: 18, cursor: 'pointer',
            }}
          >
            {muted ? '♪̸' : '♪'}
          </button>
        </div>
      </div>

      {/* Wallet + Jackpot */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 14, width: '100%', maxWidth: 960, marginBottom: 16,
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(58,42,10,0.85) 0%, rgba(28,20,6,0.85) 100%)',
          border: '1px solid rgba(240,192,64,0.5)',
          borderRadius: 16, padding: isMobile ? '18px 20px' : '22px 26px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(240,192,64,0.18), inset 0 1px 0 rgba(240,192,64,0.25), 0 0 40px rgba(240,192,64,0.08)',
        }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#8a7a4a', fontFamily: "'Cinzel', serif" }}>
              CHIPS
            </div>
            <ChipCounter value={points.balance} color="#f0c040" size={isMobile ? 40 : 48} />
          </div>
          <div style={{
            width: 62, height: 62, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #fce49a, #f0c040 40%, #7a5a10 100%)',
            border: '3px solid #4a3608',
            boxShadow: '0 6px 20px rgba(240,192,64,0.35), inset 0 -4px 8px rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3a2a08', fontFamily: "'Playfair Display', serif",
            fontSize: 20, fontWeight: 900,
          }}>♛</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(120,20,60,0.85) 0%, rgba(50,8,30,0.85) 100%)',
          border: '1px solid rgba(240,77,92,0.65)',
          borderRadius: 16, padding: isMobile ? '14px 16px' : '18px 22px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(240,77,92,0.25), inset 0 1px 0 rgba(240,77,92,0.3), 0 0 44px rgba(240,77,92,0.25)',
          animation: 'jackpotPulse 3s ease-in-out infinite',
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.25em', color: '#f04d5c',
            fontFamily: "'Cinzel', serif", marginBottom: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span><span style={{ marginRight: 6 }}>★</span>PROGRESSIVE JACKPOTS</span>
            <span style={{ color: '#8a5060', fontSize: 9 }}>4 tiers</span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
          }}>
            {JACKPOT_TIER_ORDER.map(tid => {
              const def = JACKPOT_TIERS[tid];
              const amt = points.jackpotTiers[tid] ?? def.seed;
              return (
                <div key={tid} style={{
                  background: `linear-gradient(135deg, ${def.color}22 0%, rgba(0,0,0,0.35) 100%)`,
                  border: `1px solid ${def.color}55`,
                  borderRadius: 10, padding: '8px 10px',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.2em',
                    color: def.color, fontWeight: 700,
                  }}>{def.label}</div>
                  <ChipCounter value={amt} color={def.color} size={isMobile ? 18 : 22} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* VIP progress */}
      <div style={{
        width: '100%', maxWidth: 960,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 14,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              padding: '4px 12px', borderRadius: 999,
              background: `linear-gradient(135deg, ${tier.color}55, ${tier.color}22)`,
              border: `1px solid ${tier.color}66`, color: tier.color,
              fontSize: 10, letterSpacing: '0.15em', fontFamily: "'Cinzel', serif", fontWeight: 700,
            }}>
              VIP · {tier.label.toUpperCase()}
            </div>
            <span style={{ fontSize: 11, color: '#8a7a4a', fontStyle: 'italic' }}>{tier.perk}</span>
          </div>
          {nextTier && (
            <div style={{ fontSize: 10, color: '#6a5a3a', letterSpacing: '0.05em' }}>
              {(nextTier.xpRequired - points.vipXp).toLocaleString()} XP → {nextTier.label}
            </div>
          )}
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{
            width: `${nextTier
              ? Math.min(100, ((points.vipXp - tier.xpRequired) / (nextTier.xpRequired - tier.xpRequired)) * 100)
              : 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${tier.color}, ${nextTier?.color ?? tier.color})`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Daily bonus */}
      <div style={{
        width: '100%', maxWidth: 960,
        background: dailyBonus.ready
          ? 'linear-gradient(135deg, rgba(74,222,128,0.2) 0%, rgba(6,60,38,0.4) 100%)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${dailyBonus.ready ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 12, padding: '12px 16px', marginBottom: 18,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        boxShadow: dailyBonus.ready ? '0 0 24px rgba(74,222,128,0.15)' : 'none',
      }}>
        <div>
          <div style={{
            fontSize: 10, letterSpacing: '0.2em',
            color: dailyBonus.ready ? '#4ade80' : '#8a7a4a',
            fontFamily: "'Cinzel', serif",
          }}>DAILY BONUS</div>
          <div style={{ fontSize: 14, color: '#e8dcb0', marginTop: 2 }}>
            {dailyBonus.ready
              ? `Grab your ${dailyBonus.amount.toLocaleString()} free chips.`
              : `Next drop in ${formatCountdown(dailyBonus.msUntilReady)}`}
          </div>
        </div>
        {dailyBonus.ready && (
          <button
            onClick={() => { onSfx('coin'); onClaimDailyBonus(); }}
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #14532d 100%)',
              border: '1px solid rgba(74,222,128,0.5)',
              borderRadius: 10, color: '#f5fff5',
              fontSize: 12, letterSpacing: '0.18em', fontFamily: "'Cinzel', serif", fontWeight: 700,
              padding: '10px 20px', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(74,222,128,0.3)',
            }}
          >CLAIM</button>
        )}
      </div>

      {/* Daily missions */}
      <MissionBoard state={missions} onClaim={onClaimMission} onSfx={onSfx} />

      {/* Streak banner */}
      {points.winStreak > 0 && (
        <div style={{
          width: '100%', maxWidth: 960,
          background: 'linear-gradient(90deg, rgba(240,192,64,0.15), rgba(240,77,92,0.08))',
          border: '1px solid rgba(240,192,64,0.4)',
          borderRadius: 12, padding: '10px 16px', marginBottom: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 22, color: '#f04d5c', filter: 'drop-shadow(0 0 8px rgba(240,77,92,0.6))' }}>🔥</span>
            <div>
              <div style={{ fontSize: 11, color: '#f0c040', letterSpacing: '0.18em', fontFamily: "'Cinzel', serif" }}>
                {points.winStreak}-GAME WIN STREAK
              </div>
              <div style={{ fontSize: 12, color: '#c8b078' }}>
                Current × {currentMult.toFixed(2)} → next win pays × {nextMult.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
        gap: 14, width: '100%', maxWidth: 960, marginBottom: 20,
      }}>
        {levels.map(cfg => {
          const vipOk = tier.tier >= cfg.vipRequired;
          const affordable = points.balance >= cfg.cost + sideBetsTotal;
          const locked = !vipOk;
          const disabled = locked || !affordable;
          const isH = hovered === cfg.level && !disabled;
          const potentialWinWithStreak = Math.floor(cfg.reward * nextMult);

          return (
            <div
              key={cfg.level}
              onClick={() => !disabled && handleStart(cfg)}
              onMouseEnter={() => setHovered(cfg.level)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isH
                  ? cfg.gradient
                  : `linear-gradient(135deg, ${cfg.color}22 0%, rgba(20,32,45,0.75) 55%, rgba(14,22,32,0.9) 100%)`,
                border: `1.5px solid ${isH ? cfg.color : locked ? 'rgba(255,255,255,0.08)' : `${cfg.color}55`}`,
                borderRadius: 14, padding: isMobile ? '16px 18px' : '18px 20px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.45 : affordable ? 1 : 0.6,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                transform: isH && !isMobile ? 'translateY(-4px)' : 'none',
                boxShadow: isH ? `0 12px 40px rgba(0,0,0,0.7), 0 0 30px ${cfg.glow}` : '0 4px 20px rgba(0,0,0,0.5)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: 10, right: 12,
                fontSize: 22, color: cfg.color,
                filter: `drop-shadow(0 0 8px ${cfg.glow})`,
              }}>♦</div>

              <div style={{
                fontSize: isMobile ? 18 : 20, fontWeight: 900,
                letterSpacing: '0.25em', fontFamily: "'Cinzel', serif",
                color: cfg.color, filter: `drop-shadow(0 0 8px ${cfg.glow})`,
              }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: 11, color: '#8a7a4a', fontStyle: 'italic', marginBottom: 10 }}>
                {cfg.tagline}
              </div>

              <p style={{ fontSize: 12, color: '#c8b078', lineHeight: 1.5, marginBottom: 14, minHeight: 36 }}>
                {cfg.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{
                  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 8, padding: '6px 10px',
                }}>
                  <div style={{ fontSize: 8, color: '#8a7a4a', letterSpacing: '0.18em' }}>BUY-IN</div>
                  <div style={{ fontSize: 16, color: '#f04d5c', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                    {cfg.cost.toLocaleString()}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 8, padding: '6px 10px',
                }}>
                  <div style={{ fontSize: 8, color: '#8a7a4a', letterSpacing: '0.18em' }}>PAYS</div>
                  <div style={{ fontSize: 16, color: '#4ade80', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                    +{potentialWinWithStreak.toLocaleString()}
                    {nextMult > 1 && <span style={{ fontSize: 10, color: '#f0c040', marginLeft: 4 }}>×{nextMult}</span>}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8,
              }}>
                <div style={{ fontSize: 9, color: '#6a5a3a', letterSpacing: '0.12em' }}>
                  +{cfg.jackpotContribution} → JACKPOT
                </div>
                {locked ? (
                  <div style={{ fontSize: 9, color: '#f87171', letterSpacing: '0.12em' }}>
                    VIP {VIP_TIERS[cfg.vipRequired]?.label ?? cfg.vipRequired}
                  </div>
                ) : !affordable ? (
                  <div style={{ fontSize: 9, color: '#f87171', letterSpacing: '0.12em' }}>LOW ON CHIPS</div>
                ) : (
                  <div style={{
                    fontSize: 10, color: cfg.color, letterSpacing: '0.15em',
                    fontFamily: "'Cinzel', serif", fontWeight: 700,
                  }}>SIT DOWN →</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side bets */}
      <div style={{
        width: '100%', maxWidth: 960,
        background: 'linear-gradient(135deg, rgba(30,45,60,0.5) 0%, rgba(18,28,40,0.6) 100%)',
        border: '1px solid rgba(124,230,255,0.2)',
        borderRadius: 14, padding: '16px 18px', marginBottom: 20,
        boxShadow: 'inset 0 1px 0 rgba(124,230,255,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.25em', color: '#f0c040' }}>
            SIDE BETS
          </div>
          {activeSideBets.size > 0 && (
            <div style={{ fontSize: 11, color: '#8a7a4a' }}>
              Total added to next round: <span style={{ color: '#f04d5c', fontWeight: 700 }}>{sideBetsTotal} chips</span>
            </div>
          )}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 10,
        }}>
          {Object.values(SIDE_BETS).map(bet => {
            const on = activeSideBets.has(bet.id);
            return (
              <button
                key={bet.id}
                onClick={() => toggleSideBet(bet.id)}
                style={{
                  background: on ? `${bet.color}22` : 'rgba(0,0,0,0.35)',
                  border: `1px solid ${on ? bet.color : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 12, padding: '10px 12px',
                  textAlign: 'left', cursor: 'pointer', color: '#e8dcb0',
                  transition: 'all 0.2s ease',
                  boxShadow: on ? `0 0 16px ${bet.color}44` : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.15em', color: bet.color, fontWeight: 700 }}>
                    {bet.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: '#c8b078', fontWeight: 700 }}>+{bet.payoutMultiplier}×</div>
                </div>
                <div style={{ fontSize: 10, color: '#8a7a4a', fontStyle: 'italic', lineHeight: 1.4, marginBottom: 6 }}>
                  {bet.hint}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#6a5a3a', letterSpacing: '0.12em' }}>STAKE {bet.cost}</span>
                  <span style={{
                    width: 14, height: 14, borderRadius: 4,
                    border: `1.5px solid ${bet.color}`,
                    background: on ? bet.color : 'transparent',
                    display: 'inline-block',
                  }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements strip */}
      <div style={{
        width: '100%', maxWidth: 960,
        background: 'linear-gradient(135deg, rgba(58,42,10,0.4) 0%, rgba(28,20,6,0.5) 100%)',
        border: '1px solid rgba(240,192,64,0.28)',
        borderRadius: 14, padding: '14px 18px', marginBottom: 20,
        boxShadow: 'inset 0 1px 0 rgba(240,192,64,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.25em', color: '#c8d0e0' }}>
            ACHIEVEMENTS
          </div>
          <div style={{ fontSize: 11, color: '#8a7a4a' }}>
            {points.unlockedAchievements.length} / {ACHIEVEMENTS.length}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = points.unlockedAchievements.includes(a.id);
            return (
              <div
                key={a.id}
                title={`${a.label}: ${a.hint} — ${unlocked ? 'unlocked' : `reward ${a.reward} chips`}`}
                style={{
                  flexShrink: 0, width: 118, padding: '10px 8px',
                  background: unlocked
                    ? 'linear-gradient(135deg, rgba(240,192,64,0.2), rgba(122,90,16,0.15))'
                    : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${unlocked ? 'rgba(240,192,64,0.5)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 10, textAlign: 'center',
                  opacity: unlocked ? 1 : 0.55,
                }}
              >
                <div style={{
                  fontSize: 24, color: unlocked ? '#f0c040' : '#5a4a2a',
                  filter: unlocked ? 'drop-shadow(0 0 8px rgba(240,192,64,0.5))' : 'none',
                }}>{a.icon}</div>
                <div style={{ fontSize: 10, color: unlocked ? '#e8dcb0' : '#6a5a3a', marginTop: 2, fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
                  {a.label}
                </div>
                <div style={{ fontSize: 9, color: '#5a4a2a', marginTop: 2 }}>
                  {unlocked ? '✓ CLAIMED' : `+${a.reward}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chip / board skins */}
      <div style={{
        width: '100%', maxWidth: 960,
        background: 'linear-gradient(135deg, rgba(30,45,60,0.5) 0%, rgba(18,28,40,0.6) 100%)',
        border: '1px solid rgba(124,230,255,0.2)',
        borderRadius: 14, padding: '14px 18px', marginBottom: 20,
        boxShadow: 'inset 0 1px 0 rgba(124,230,255,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.25em', color: '#7ce6ff' }}>
            ♦ CHIP THEMES
          </div>
          <div style={{ fontSize: 11, color: '#5a8aa8', fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}>
            {unlockedSkins.length} / {CHIP_SKIN_ORDER.length} unlocked · advance VIP to unlock more
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: 8,
        }}>
          {CHIP_SKIN_ORDER.map(id => {
            const s = CHIP_SKINS[id];
            const unlocked = unlockedSkins.includes(id);
            const active = activeSkin === id;
            return (
              <button
                key={id}
                onClick={() => { if (unlocked) onEquipSkin(id); else onSfx('error'); }}
                onMouseEnter={() => unlocked && onSfx('hover')}
                disabled={!unlocked}
                style={{
                  background: unlocked
                    ? active
                      ? `linear-gradient(135deg, ${s.playerColor}44, ${s.houseColor}22)`
                      : `linear-gradient(135deg, ${s.playerColor}22, ${s.houseColor}0a)`
                    : 'rgba(0,0,0,0.4)',
                  border: `1.5px solid ${active ? s.playerColor : unlocked ? `${s.playerColor}44` : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12, padding: '10px 8px',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.5,
                  color: '#e8dcb0',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? `0 0 24px ${s.playerColor}55` : 'none',
                }}
              >
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, ${s.playerColor}, ${s.boardDark})`,
                    border: '1px solid rgba(0,0,0,0.4)',
                  }} />
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, ${s.houseColor}, ${s.boardDark})`,
                    border: '1px solid rgba(0,0,0,0.4)',
                  }} />
                </div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.1em',
                  color: active ? s.playerColor : unlocked ? '#c8b078' : '#5a4a2a',
                }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: '#5a4a2a', marginTop: 2 }}>
                  {active ? '✓ EQUIPPED' : unlocked ? 'TAP TO EQUIP' : `VIP ${VIP_TIERS[s.vipRequired]?.label ?? s.vipRequired}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        width: '100%', maxWidth: 960,
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 10, marginBottom: 18,
      }}>
        <StatTile label="Total Wins" value={points.totalWins} color="#4ade80" />
        <StatTile label="Best Streak" value={points.bestStreak} color="#f0c040" />
        <StatTile label="Biggest Win" value={points.biggestWin} color="#7ce6ff" />
        <StatTile label="Total Losses" value={points.totalLosses} color="#f87171" />
      </div>

      {points.balance < 5 && (
        <button
          onClick={() => { onSfx('chipClick'); onResetPoints(); }}
          style={{
            background: 'linear-gradient(135deg, rgba(240,77,92,0.15), rgba(90,10,20,0.4))',
            border: '1px solid rgba(240,77,92,0.4)',
            borderRadius: 10, color: '#f04d5c',
            fontSize: 11, letterSpacing: '0.2em', fontFamily: "'Cinzel', serif",
            padding: '12px 24px', cursor: 'pointer',
          }}
        >
          RESET CHIPS TO 100
        </button>
      )}

      <p style={{
        maxWidth: 620, textAlign: 'center', color: '#5a4a2a',
        fontSize: 11, lineHeight: 1.65, marginTop: 24, fontStyle: 'italic',
        fontFamily: "'Crimson Pro', serif",
      }}>
        Virtual chips only — no real money. Wins depend on skill vs the AI. Chips carry no cash value.
        Higher tables contribute more to the progressive jackpot and pay bigger rewards.
      </p>

      <style>{`
        @keyframes jackpotPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(240,77,92,0.12), 0 0 30px rgba(240,77,92,0.15); }
          50%      { box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(240,77,92,0.12), 0 0 50px rgba(240,77,92,0.35); }
        }
      `}</style>
    </div>
  );
};

const StatTile: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{
    background: `linear-gradient(135deg, ${color}22 0%, rgba(20,30,42,0.55) 100%)`,
    border: `1px solid ${color}55`,
    borderRadius: 12, padding: '10px 12px', textAlign: 'center',
    boxShadow: `inset 0 1px 0 ${color}22, 0 0 20px ${color}18`,
  }}>
    <div style={{ fontSize: 22, color, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
      {value.toLocaleString()}
    </div>
    <div style={{ fontSize: 9, color: '#6a5a3a', letterSpacing: '0.15em', fontFamily: "'Cinzel', serif", marginTop: 2 }}>
      {label.toUpperCase()}
    </div>
  </div>
);

export default GameLobby;
