import React, { useState } from 'react';
import {
  ACHIEVEMENTS, DifficultyLevel, JACKPOT_TIERS, JACKPOT_TIER_ORDER,
  LEVEL_CONFIGS, LevelConfig, MissionsState, MISSION_TEMPLATES,
  PointsState, SIDE_BETS, SideBetId, VipTier, nextVipTier,
} from '../types/game.types';
import { DailyBonusStatus } from '../hooks/usePoints';

const GOLD = '#f0c040';
const GOLD_INK = '#8a7a4a';
const GREEN = '#4ade80';
const VIOLET = '#c07ce6';
const CREAM = '#f0e6cf';
const PANEL_BG = 'linear-gradient(180deg, rgba(20,26,22,0.92) 0%, rgba(10,14,12,0.94) 100%)';
const PANEL_BORDER = '1px solid rgba(240,192,64,0.18)';
const HEADING = "'Cinzel', serif";
const DISPLAY = "'Playfair Display', serif";
const BODY = "'Crimson Pro', serif";

const cap = (size = 9, ls = '0.22em', color = GOLD_INK) => ({
  fontFamily: HEADING, fontSize: size, letterSpacing: ls, color,
  textTransform: 'uppercase' as const,
});

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: PANEL_BG, border: PANEL_BORDER, borderRadius: 14,
    boxShadow: '0 8px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)',
    ...style,
  }}>{children}</div>
);

const SectionHeader: React.FC<{ title: string; right?: React.ReactNode; accent?: string }> = ({ title, right, accent = GOLD }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 4px 12px' }}>
    <span style={{ color: accent, fontSize: 12 }}>◆</span>
    <div style={{ ...cap(11, '0.28em', CREAM), fontWeight: 700 }}>{title}</div>
    {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
  </div>
);

function fmt(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

const QuickPlayHero: React.FC<{ cfg: LevelConfig; onPlay: () => void }> = ({ cfg, onPlay }) => (
  <Panel style={{
    padding: 22,
    background:
      'radial-gradient(ellipse at 85% 50%, rgba(74,222,128,0.14) 0%, transparent 55%),' +
      'linear-gradient(180deg, rgba(20,26,22,0.94), rgba(6,12,10,0.98))',
    border: '1px solid rgba(240,192,64,0.28)',
    minHeight: 220, position: 'relative', overflow: 'hidden',
  }}>
    <div style={cap(10, '0.28em', GREEN)}>QUICK PLAY</div>
    <div style={{
      fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, letterSpacing: '0.04em',
      color: CREAM, marginTop: 6, lineHeight: 1,
    }}>{cfg.label} ROOM</div>
    <div style={{ marginTop: 8, color: 'rgba(200,190,170,0.7)', fontFamily: BODY, fontSize: 13 }}>
      Min Bet: {cfg.cost} · Max Bet: {cfg.cost * 100}
    </div>
    <button onClick={onPlay} className="kf-tap" style={{
      marginTop: 20, padding: '14px 32px',
      background: 'linear-gradient(180deg, #f8d070 0%, #d4a437 55%, #7a5a10 100%)',
      border: '1px solid rgba(255,220,120,0.55)',
      borderRadius: 10, color: '#20140a',
      fontFamily: HEADING, fontSize: 13, letterSpacing: '0.28em', fontWeight: 900,
      cursor: 'pointer', minHeight: 48,
      boxShadow: '0 10px 24px rgba(240,192,64,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
    }}>PLAY NOW</button>
    <div className="kf-float" style={{
      position: 'absolute', right: 30, top: 40,
      width: 130, height: 130, borderRadius: '50%',
      background: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.35), rgba(30,45,55,0.9) 55%, rgba(5,10,12,0.95))',
      boxShadow: '0 20px 45px rgba(74,222,128,0.25), inset 0 4px 12px rgba(255,255,255,0.15)',
      border: '1px solid rgba(120,180,200,0.35)',
      pointerEvents: 'none',
    }} />
  </Panel>
);

const ProgressiveJackpots: React.FC<{ tiers: Record<string, number> }> = ({ tiers }) => (
  <Panel style={{
    padding: 18,
    background:
      'radial-gradient(ellipse at 50% 0%, rgba(240,77,92,0.18) 0%, transparent 55%),' +
      'linear-gradient(180deg, rgba(40,10,25,0.9), rgba(20,5,15,0.95))',
    border: '1px solid rgba(240,77,92,0.35)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={cap(10, '0.28em', '#ff8ea0')}>◆ PROGRESSIVE JACKPOTS</div>
      <div style={cap(9, '0.14em')}>4 tiers</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {JACKPOT_TIER_ORDER.map(id => {
        const t = JACKPOT_TIERS[id];
        return (
          <div key={id} style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'linear-gradient(180deg, rgba(80,15,35,0.6), rgba(40,8,20,0.75))',
            border: '1px solid rgba(240,77,92,0.25)',
          }}>
            <div style={cap(9, '0.22em', 'rgba(200,190,170,0.6)')}>{t.label}</div>
            <div style={{
              fontFamily: DISPLAY, fontSize: 22, fontWeight: 900, color: t.color,
              marginTop: 2,
            }}>{tiers[id]?.toLocaleString() ?? '—'}</div>
          </div>
        );
      })}
    </div>
  </Panel>
);

const VipAccessBar: React.FC<{ tier: VipTier; xp: number }> = ({ tier, xp }) => {
  const nxt = nextVipTier(xp);
  const from = tier.xpRequired;
  const to = nxt ? nxt.xpRequired : Math.max(xp, from + 1);
  const pct = Math.min(100, Math.max(0, ((xp - from) / (to - from)) * 100));
  return (
    <Panel style={{ padding: '10px 16px' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          padding: '4px 10px', borderRadius: 6,
          background: `linear-gradient(90deg, ${tier.color}22, ${tier.color}05)`,
          border: `1px solid ${tier.color}44`,
          fontFamily: HEADING, fontSize: 9, letterSpacing: '0.22em', color: tier.color, fontWeight: 700,
        }}>VIP - {tier.label.toUpperCase()}</div>
        <div style={{ flex: 1, fontFamily: BODY, fontStyle: 'italic', color: 'rgba(200,190,170,0.7)', fontSize: 12, minWidth: 200 }}>
          {tier.perk}
        </div>
        <div style={cap(9, '0.14em')}>{xp.toLocaleString()} / {to.toLocaleString()} XP</div>
      </div>
      <div style={{
        marginTop: 8, height: 5, borderRadius: 999,
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${VIOLET}, ${tier.color})`,
          boxShadow: `0 0 8px ${tier.color}88`,
        }} />
      </div>
    </Panel>
  );
};

const DailyBonusBar: React.FC<{ status: DailyBonusStatus; onClaim: () => void; onSfx: (n: 'coin' | 'error') => void }> =
  ({ status, onClaim, onSfx }) => {
    const ready = status.ready;
    return (
      <Panel style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={cap(10, '0.28em', CREAM)}>DAILY BONUS</div>
          <div style={{
            fontFamily: DISPLAY, fontSize: 18, fontWeight: 800,
            color: ready ? GREEN : CREAM, marginTop: 4,
          }}>{ready ? 'Ready to claim' : `Next drop in ${fmt(status.msUntilReady)}`}</div>
        </div>
        <button onClick={() => { if (ready) { onSfx('coin'); onClaim(); } else onSfx('error'); }} className="kf-tap" style={{
          padding: '10px 18px', borderRadius: 10,
          background: ready
            ? 'linear-gradient(180deg, #f8d070 0%, #d4a437 55%, #7a5a10 100%)'
            : 'linear-gradient(180deg, rgba(80,60,20,0.85), rgba(40,30,10,0.9))',
          border: ready ? '1px solid rgba(255,220,120,0.55)' : `1px solid ${GOLD_INK}66`,
          color: ready ? '#20140a' : GOLD_INK,
          fontFamily: HEADING, fontSize: 11, letterSpacing: '0.22em', fontWeight: 900,
          cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center',
          minHeight: 40,
        }}>
          <span>{ready ? '🎁' : '⏳'}</span>
          {ready ? 'CLAIM' : 'CLAIM SOON'}
        </button>
      </Panel>
    );
  };

const DailyMissions: React.FC<{
  missions: MissionsState;
  onClaim: (id: string) => void;
  onSfx: (n: 'chipClick' | 'coin' | 'error') => void;
  isMobile: boolean;
}> = ({ missions, onClaim, onSfx, isMobile }) => {
  const list = missions.missions.slice(0, 3);
  const claimedCount = missions.missions.filter(m => m.claimed).length;
  return (
    <Panel style={{ padding: 18 }}>
      <SectionHeader
        title="DAILY MISSIONS"
        right={<div style={cap(9, '0.14em')}>{claimedCount} / {missions.missions.length} CLAIMED · RESETS 00:00 UTC</div>}
        accent={VIOLET}
      />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
        {list.map(m => {
          const tpl = MISSION_TEMPLATES.find(t => t.id === m.templateId);
          if (!tpl) return null;
          const pct = Math.min(100, (m.progress / m.target) * 100);
          const done = m.progress >= m.target;
          return (
            <div key={m.templateId} style={{
              padding: 14, borderRadius: 12,
              background: 'linear-gradient(180deg, rgba(40,20,60,0.55), rgba(20,10,35,0.7))',
              border: `1px solid ${done ? GREEN : 'rgba(192,124,230,0.28)'}55`,
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: done
                    ? 'radial-gradient(circle at 30% 30%, rgba(74,222,128,0.6), rgba(20,80,40,0.9))'
                    : 'radial-gradient(circle at 30% 30%, rgba(192,124,230,0.5), rgba(60,20,90,0.9))',
                  border: `1px solid ${done ? GREEN : VIOLET}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: done ? GREEN : VIOLET,
                }}>{done ? '✓' : tpl.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...cap(10, '0.15em', CREAM), fontWeight: 700 }}>{tpl.label.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: 'rgba(200,190,170,0.7)', fontFamily: BODY }}>{tpl.hint}</div>
                </div>
                <div style={{ fontFamily: DISPLAY, fontSize: 14, color: GOLD, fontWeight: 800 }}>+{tpl.reward}</div>
              </div>
              <div style={{
                marginTop: 10, height: 5, borderRadius: 999,
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: done
                    ? `linear-gradient(90deg, ${GREEN}, #14b054)`
                    : 'linear-gradient(90deg, #f8d070, #d4a437)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <div style={cap(9, '0.14em')}>{m.progress} / {m.target}</div>
                {m.claimed
                  ? <div style={cap(9, '0.14em', GREEN)}>✓ CLAIMED</div>
                  : done
                    ? <button onClick={() => { onSfx('coin'); onClaim(m.templateId); }} className="kf-tap" style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: 'rgba(74,222,128,0.15)', border: `1px solid ${GREEN}66`,
                        color: GREEN, fontFamily: HEADING, fontSize: 9, letterSpacing: '0.22em', fontWeight: 800,
                        cursor: 'pointer',
                      }}>CLAIM</button>
                    : null
                }
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

const RoomCards: React.FC<{
  onSelect: (level: DifficultyLevel) => void;
  tierNum: number;
  onSfx: (n: 'chipClick' | 'error' | 'hover') => void;
  isMobile: boolean;
}> = ({ onSelect, tierNum, onSfx, isMobile }) => {
  const levels: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert', 'highroller'];
  return (
    <div>
      <SectionHeader title="CHOOSE YOUR ROOM" />
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(5, minmax(220px, 1fr))' : 'repeat(5, 1fr)',
        gap: 12,
        minWidth: isMobile ? 1100 : 'auto',
      }}>
        {levels.map(level => {
          const cfg = LEVEL_CONFIGS[level];
          const locked = tierNum < cfg.vipRequired;
          return (
            <button
              key={level}
              onClick={() => { if (locked) onSfx('error'); else { onSfx('chipClick'); onSelect(level); } }}
              className="kf-tap"
              style={{
                textAlign: 'left', padding: 16, borderRadius: 14,
                background: cfg.gradient,
                border: `1px solid ${cfg.color}55`,
                color: CREAM, cursor: 'pointer', minHeight: 220,
                boxShadow: `0 8px 22px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
                opacity: locked ? 0.55 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  fontFamily: DISPLAY, fontWeight: 900, fontSize: 22,
                  letterSpacing: '0.05em', color: cfg.color,
                }}>{cfg.label}</div>
                <div style={{ color: cfg.color, fontSize: 12 }}>◆</div>
              </div>
              <div style={{ fontFamily: BODY, fontStyle: 'italic', color: 'rgba(240,230,207,0.7)', fontSize: 12, marginTop: 4 }}>
                {cfg.tagline}
              </div>
              <div style={{
                marginTop: 10, fontSize: 12, color: 'rgba(240,230,207,0.8)',
                fontFamily: BODY, lineHeight: 1.35,
              }}>{cfg.description}</div>
              <div style={{
                marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
              }}>
                <div style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={cap(8, '0.2em')}>BUY-IN</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: cfg.color, marginTop: 2 }}>{cfg.cost}</div>
                </div>
                <div style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={cap(8, '0.2em')}>PAYS</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: GREEN, marginTop: 2 }}>+{cfg.reward}</div>
                </div>
              </div>
              <div style={{ ...cap(9, '0.14em'), marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                {locked ? `🔒 VIP ${cfg.vipRequired} REQUIRED` : `TABLES ${20 + level.length * 3}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SideBetsRow: React.FC<{
  picks: SideBetId[]; onToggle: (id: SideBetId) => void; onSfx: (n: 'chipClick') => void; isMobile: boolean;
}> = ({ picks, onToggle, onSfx, isMobile }) => (
  <Panel style={{ padding: 18 }}>
    <SectionHeader title="SIDE BETS" right={<div style={cap(9, '0.14em')}>Tap to toggle</div>} />
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
      {(Object.keys(SIDE_BETS) as SideBetId[]).map(id => {
        const b = SIDE_BETS[id];
        const active = picks.includes(id);
        return (
          <button key={id} onClick={() => { onSfx('chipClick'); onToggle(id); }} className="kf-tap" style={{
            padding: 12, borderRadius: 10, textAlign: 'left', cursor: 'pointer',
            background: active
              ? `linear-gradient(180deg, ${b.color}22, ${b.color}0a)`
              : 'rgba(255,255,255,0.02)',
            border: `1px solid ${active ? b.color : 'rgba(255,255,255,0.06)'}`,
            color: CREAM, minHeight: 88,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ ...cap(10, '0.22em', b.color), fontWeight: 700 }}>{b.label.toUpperCase()}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 12, color: GREEN, fontWeight: 800 }}>+{b.payoutMultiplier}x</div>
            </div>
            <div style={{ fontFamily: BODY, fontSize: 11, color: 'rgba(200,190,170,0.7)', marginTop: 4, lineHeight: 1.35 }}>
              {b.hint}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={cap(9, '0.14em')}>STAKE {b.cost}</div>
              <div style={{
                width: 14, height: 14, borderRadius: 3,
                background: active ? b.color : 'transparent',
                border: `1px solid ${b.color}88`,
              }} />
            </div>
          </button>
        );
      })}
    </div>
  </Panel>
);

const AchievementsRow: React.FC<{ unlocked: string[]; isMobile: boolean }> = ({ unlocked, isMobile }) => (
  <Panel style={{ padding: 18 }}>
    <SectionHeader title="ACHIEVEMENTS" right={<div style={cap(9, '0.14em')}>{unlocked.length} / {ACHIEVEMENTS.length}</div>} />
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: 10 }}>
      {ACHIEVEMENTS.slice(0, isMobile ? 6 : 5).map(a => {
        const got = unlocked.includes(a.id);
        return (
          <div key={a.id} style={{
            padding: 10, borderRadius: 10, textAlign: 'center',
            background: got
              ? 'linear-gradient(180deg, rgba(240,192,64,0.18), rgba(80,60,20,0.4))'
              : 'rgba(255,255,255,0.02)',
            border: `1px solid ${got ? GOLD : 'rgba(255,255,255,0.06)'}55`,
            opacity: got ? 1 : 0.5,
          }}>
            <div style={{ fontSize: 22, color: got ? GOLD : GOLD_INK }}>{a.icon}</div>
            <div style={{ ...cap(8, '0.15em', got ? CREAM : GOLD_INK), fontWeight: 700, marginTop: 4 }}>{a.label.toUpperCase()}</div>
            <div style={{
              fontFamily: DISPLAY, fontSize: 12, fontWeight: 800,
              color: got ? GREEN : GOLD_INK, marginTop: 3,
            }}>{got ? 'CLAIMED' : a.reward}</div>
          </div>
        );
      })}
    </div>
  </Panel>
);

interface Props {
  points: PointsState;
  tier: VipTier;
  dailyBonus: DailyBonusStatus;
  missions: MissionsState;
  onClaimDaily: () => void;
  onClaimMission: (id: string) => void;
  onStartGame: (level: DifficultyLevel, betIds: SideBetId[]) => void;
  onSfx: (n: 'chipClick' | 'coin' | 'error' | 'hover' | 'missionComplete') => void;
  isMobile: boolean;
}

const LobbyBody: React.FC<Props> = ({
  points, tier, dailyBonus, missions,
  onClaimDaily, onClaimMission, onStartGame, onSfx, isMobile,
}) => {
  const [picks, setPicks] = useState<SideBetId[]>([]);
  const togglePick = (id: SideBetId) =>
    setPicks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const quickLevel: DifficultyLevel = tier.tier >= 1 ? 'medium' : 'easy';
  const quickCfg = LEVEL_CONFIGS[quickLevel];

  const start = (level: DifficultyLevel) => onStartGame(level, picks);

  return (
    <div style={{ padding: isMobile ? '10px 4px 20px' : '4px 4px 12px', color: CREAM, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 14,
      }}>
        <QuickPlayHero cfg={quickCfg} onPlay={() => { onSfx('chipClick'); start(quickLevel); }} />
        <ProgressiveJackpots tiers={points.jackpotTiers} />
      </div>

      <VipAccessBar tier={tier} xp={points.vipXp} />
      <DailyBonusBar status={dailyBonus} onClaim={onClaimDaily} onSfx={onSfx} />

      <DailyMissions missions={missions} onClaim={onClaimMission} onSfx={onSfx} isMobile={isMobile} />

      <div className={isMobile ? 'kf-scroll-x' : ''} style={{
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
      }}>
        <RoomCards onSelect={start} tierNum={tier.tier} onSfx={onSfx} isMobile={isMobile} />
      </div>

      <button onClick={() => onSfx('chipClick')} className="kf-tap" style={{
        padding: '14px', borderRadius: 12,
        background: 'linear-gradient(180deg, rgba(38,26,10,0.9), rgba(18,12,4,0.95))',
        border: `1px solid ${GOLD}44`,
        color: GOLD, cursor: 'pointer',
        fontFamily: HEADING, fontSize: 11, letterSpacing: '0.28em', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        minHeight: 44,
      }}>⛃ BROWSE ALL TABLES</button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 14,
      }}>
        <SideBetsRow picks={picks} onToggle={togglePick} onSfx={onSfx} isMobile={isMobile} />
        <AchievementsRow unlocked={points.unlockedAchievements} isMobile={isMobile} />
      </div>
    </div>
  );
};

export default LobbyBody;
