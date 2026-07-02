import React, { useEffect, useRef, useState } from 'react';
import ChipCounter from './ChipCounter';
import { PointsState, VipTier, nextVipTier } from '../types/game.types';
import { DailyBonusStatus } from '../hooks/usePoints';

const GOLD = '#f8ce55';
const GOLD_INK = '#c0a870';
const GREEN = '#5ee88f';
const RED = '#ff5a6c';
const PINK = '#ff9db0';
const VIOLET = '#d090ee';
const CREAM = '#f5ecd6';
const PANEL_BG = 'linear-gradient(180deg, rgba(34,42,36,0.94) 0%, rgba(20,26,22,0.96) 100%)';
const PANEL_BORDER = '1px solid rgba(248,206,85,0.28)';
const HEADING = "'Cinzel', serif";
const DISPLAY = "'Playfair Display', serif";
const BODY = "'Crimson Pro', serif";

const cap = (size = 9, ls = '0.22em', color = GOLD_INK) => ({
  fontFamily: HEADING, fontSize: size, letterSpacing: ls, color,
  textTransform: 'uppercase' as const,
});

export type NavKey = 'play' | 'missions' | 'vip' | 'leaderboard' | 'store' | 'promotions';

const NAV_ITEMS: { key: NavKey; icon: string; label: string }[] = [
  { key: 'play', icon: '♟', label: 'PLAY' },
  { key: 'missions', icon: '♛', label: 'MISSIONS' },
  { key: 'vip', icon: '♚', label: 'VIP CLUB' },
  { key: 'leaderboard', icon: '▤', label: 'LEADERBOARD' },
  { key: 'store', icon: '⛃', label: 'STORE' },
  { key: 'promotions', icon: '✦', label: 'PROMOTIONS' },
];

interface Props {
  points: PointsState;
  muted: boolean;
  isMobile: boolean;
  onToggleMute: () => void;
  onCashier: () => void;
  children: React.ReactNode;

  // Sidebar props — desktop only
  tier: VipTier;
  dailyBonus: DailyBonusStatus;
  missionsCount: number;
  activeNav?: NavKey;
  onNav?: (key: NavKey) => void;
  onClaimDaily?: () => void;
  onSfx?: (name: 'chipClick' | 'coin' | 'error' | 'hover') => void;
  onQuickPlay?: () => void;
  onOpenPromotions?: () => void;
}

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: PANEL_BG, border: PANEL_BORDER, borderRadius: 14,
    boxShadow: '0 8px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)',
    ...style,
  }}>{children}</div>
);

const BrandBlock: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '18px 12px 8px' }}>
    <div style={{ fontSize: 20, color: GOLD, lineHeight: 1 }} className="kf-float">♛</div>
    <div style={cap(8, '0.4em')}>HOUSE OF</div>
    <div className="kf-shimmer-gold" style={{
      fontFamily: DISPLAY, fontWeight: 900,
      fontSize: 30, letterSpacing: '0.06em', lineHeight: 1.05, marginTop: 2,
    }}>KINGFALL</div>
    <div style={{ ...cap(7, '0.35em'), marginTop: 4 }}>PREMIUM CASINO GAMES</div>
  </div>
);

const NavRow: React.FC<{
  item: typeof NAV_ITEMS[number];
  active: boolean;
  badge?: number;
  onClick: () => void;
}> = ({ item, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className="kf-tap"
    style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 16px',
      background: active
        ? 'linear-gradient(90deg, rgba(240,192,64,0.18), rgba(240,192,64,0.02))'
        : 'transparent',
      border: 'none',
      borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
      color: active ? GOLD : CREAM,
      cursor: 'pointer',
      fontFamily: HEADING,
      fontSize: 12, letterSpacing: '0.22em', fontWeight: 700,
      textAlign: 'left', width: '100%', borderRadius: 8,
      minHeight: 44,
    }}
  >
    <span style={{ fontSize: 15, opacity: 0.9, width: 18, textAlign: 'center' }}>{item.icon}</span>
    <span style={{ flex: 1 }}>{item.label}</span>
    {badge !== undefined && badge > 0 && (
      <span style={{
        background: RED, color: '#fff',
        borderRadius: 999, minWidth: 20, height: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontFamily: DISPLAY, fontWeight: 700, padding: '0 6px',
      }}>{badge}</span>
    )}
  </button>
);

const VipCard: React.FC<{ tier: VipTier; xp: number }> = ({ tier, xp }) => {
  const nxt = nextVipTier(xp);
  const from = tier.xpRequired;
  const to = nxt ? nxt.xpRequired : Math.max(xp, from + 1);
  const pct = Math.min(100, Math.max(0, ((xp - from) / (to - from)) * 100));
  return (
    <Panel style={{ padding: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `linear-gradient(135deg, ${tier.color}55, ${tier.color}18)`,
          border: `1px solid ${tier.color}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: tier.color, fontSize: 20,
        }}>♛</div>
        <div style={{ flex: 1 }}>
          <div style={cap(8, '0.3em', VIOLET)}>VIP {tier.label.toUpperCase()}</div>
          <div style={{ ...cap(10, '0.2em', tier.color), marginTop: 2 }}>{tier.label} TIER</div>
        </div>
      </div>
      <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${VIOLET}, ${tier.color})`,
          boxShadow: `0 0 8px ${tier.color}88`, transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ ...cap(9, '0.15em'), marginTop: 6 }}>
        {xp.toLocaleString()} / {to.toLocaleString()} XP
      </div>
    </Panel>
  );
};

const DailyBonusCard: React.FC<{ status: DailyBonusStatus; onClaim: () => void; onSfx?: (n: 'chipClick' | 'coin' | 'error' | 'hover') => void }>
  = ({ status, onClaim, onSfx }) => {
  const ready = status.ready;
  const label = ready ? 'Claim now' : formatDuration(status.msUntilReady);
  return (
    <Panel style={{ padding: 12 }}>
      <button
        onClick={() => {
          if (ready) { onSfx?.('coin'); onClaim(); }
          else { onSfx?.('error'); }
        }}
        className="kf-tap"
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: 4, background: 'transparent', border: 'none',
          cursor: 'pointer', color: 'inherit', textAlign: 'left',
          minHeight: 52,
        }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(192,124,230,0.35), rgba(74,32,120,0.4))',
          border: '1px solid rgba(192,124,230,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>🎁</div>
        <div style={{ flex: 1 }}>
          <div style={{ ...cap(10, '0.18em', CREAM), fontWeight: 700 }}>DAILY BONUS</div>
          <div style={cap(9, '0.15em')}>{ready ? 'Ready to claim' : 'Next drop in'}</div>
          <div style={{
            fontFamily: DISPLAY, fontSize: 16, fontWeight: 800,
            color: ready ? GREEN : CREAM, marginTop: 1,
          }}>{label}</div>
        </div>
        <div style={{ color: ready ? GREEN : GOLD_INK, fontSize: 18 }}>›</div>
      </button>
    </Panel>
  );
};

const WeekendBoostCard: React.FC<{
  onSfx?: (n: 'chipClick' | 'coin' | 'error' | 'hover') => void;
  onOpen?: () => void;
}> = ({ onSfx, onOpen }) => (
  <button
    onClick={() => { onSfx?.('chipClick'); onOpen?.(); }}
    className="kf-tap"
    style={{
      padding: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
      background: 'linear-gradient(180deg, rgba(60,20,90,0.75) 0%, rgba(30,10,50,0.9) 100%)',
      border: '1px solid rgba(192,124,230,0.35)', borderRadius: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)',
      color: CREAM, minHeight: 66,
    }}
  >
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{
        width: 46, height: 46, borderRadius: 10,
        background: 'radial-gradient(circle at 30% 30%, #f8d070, #b85a20)',
        border: '1px solid rgba(240,192,64,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, boxShadow: '0 4px 14px rgba(240,192,64,0.35)',
      }}>◉</div>
      <div style={{ flex: 1 }}>
        <div style={{ ...cap(9, '0.18em', VIOLET), fontWeight: 700 }}>WEEKEND BOOST</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: GOLD, marginTop: 2 }}>
          +25% <span style={{ color: CREAM, fontSize: 12, fontWeight: 400 }}>chips</span>
        </div>
        <div style={{ ...cap(9, '0.15em'), marginTop: 3 }}>⏱ 2d 17h 38m</div>
      </div>
    </div>
  </button>
);

function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

const CasinoChrome: React.FC<Props> = ({
  points, muted, isMobile, onToggleMute, onCashier, children,
  tier, dailyBonus, missionsCount, activeNav, onNav, onClaimDaily, onSfx,
  onQuickPlay, onOpenPromotions,
}) => {
  const bg =
    'radial-gradient(ellipse at 12% 8%, rgba(248,206,85,0.18) 0%, transparent 55%),' +
    'radial-gradient(ellipse at 88% 12%, rgba(94,232,143,0.16) 0%, transparent 55%),' +
    'radial-gradient(ellipse at 50% 100%, rgba(248,206,85,0.10) 0%, transparent 45%),' +
    'linear-gradient(180deg, #16201c 0%, #0e1512 100%)';

  const [localNav, setLocalNav] = useState<NavKey>(activeNav ?? 'play');
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const currentNav = activeNav ?? localNav;

  useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (y < 24) setTabBarVisible(true);
      else if (delta > 6) setTabBarVisible(false);
      else if (delta < -6) setTabBarVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  const handleNav = (k: NavKey) => {
    onSfx?.('chipClick');
    setLocalNav(k);
    onNav?.(k);
  };

  const Sidebar = !isMobile ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="kf-slide-up">
      <Panel style={{ padding: 8 }}>
        <BrandBlock />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 6px 10px' }}>
          {NAV_ITEMS.map(item => (
            <NavRow
              key={item.key}
              item={item}
              active={currentNav === item.key}
              badge={item.key === 'missions' ? missionsCount : undefined}
              onClick={() => handleNav(item.key)}
            />
          ))}
        </div>
      </Panel>
      <VipCard tier={tier} xp={points.vipXp} />
      {onClaimDaily && <DailyBonusCard status={dailyBonus} onClaim={onClaimDaily} onSfx={onSfx} />}
      <WeekendBoostCard onSfx={onSfx} onOpen={onOpenPromotions} />
    </div>
  ) : null;

  return (
    <div style={{
      minHeight: '100dvh', background: bg, color: CREAM,
      display: 'flex', flexDirection: 'column',
      paddingLeft: 'var(--kf-safe-left)', paddingRight: 'var(--kf-safe-right)',
      overflowX: 'hidden', maxWidth: '100vw',
    }}>
      <div className="kf-glass kf-safe-top" style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', gap: isMobile ? 6 : 14, alignItems: 'center',
        padding: isMobile ? '6px 8px' : '12px 20px',
      }}>
        {isMobile && (
          <div className="kf-shimmer-gold" style={{
            fontFamily: DISPLAY, fontWeight: 900, fontSize: 20,
            letterSpacing: '0.04em', flexShrink: 0, paddingLeft: 4,
          }}>KINGFALL</div>
        )}
        {!isMobile && <div style={{ width: 260 - 40 }} />}

        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '6px 12px', borderRadius: 999, minHeight: 40,
          background: 'linear-gradient(180deg, rgba(38,26,10,0.9), rgba(18,12,4,0.95))',
          border: `1px solid ${GOLD}44`,
          flex: isMobile ? '1 1 auto' : '0 0 auto', minWidth: 0,
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #f8d070, #7a5a10)',
            border: '1px solid rgba(255,220,120,0.6)', flexShrink: 0,
          }} className="kf-coin" />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={cap(7, '0.22em')}>CHIPS</span>
            <ChipCounter value={points.balance} color={CREAM} size={isMobile ? 14 : 16} />
          </div>
        </div>

        {points.winStreak > 0 && (
          <div title={`${points.winStreak}× streak`} style={{
            display: 'flex', gap: 6, alignItems: 'center',
            padding: '6px 10px', borderRadius: 999, minHeight: 36,
            background: 'linear-gradient(180deg, rgba(240,77,92,0.28), rgba(80,20,30,0.5))',
            border: `1px solid ${RED}66`,
          }}>
            <span style={{ color: RED, fontSize: 14 }}>🔥</span>
            <span style={{ fontFamily: DISPLAY, fontSize: isMobile ? 12 : 14, fontWeight: 900, color: CREAM }}>
              {points.winStreak}×
            </span>
          </div>
        )}
        {!isMobile && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '6px 12px', borderRadius: 999, minHeight: 40,
            background: 'linear-gradient(180deg, rgba(60,10,30,0.85), rgba(30,5,15,0.9))',
            border: `1px solid ${PINK}55`,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #ff8ea0, #6a1030)',
              border: '1px solid rgba(255,142,160,0.6)',
              color: '#fff', textAlign: 'center', lineHeight: '22px', fontSize: 13,
            }}>★</span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={cap(7, '0.22em', PINK)}>JACKPOT</span>
              <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: CREAM, marginTop: 2 }}>
                {points.jackpot.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isMobile && (
            <button onClick={onToggleMute} title={muted ? 'Unmute' : 'Mute'} className="kf-tap" style={{
              background: 'rgba(240,192,64,0.10)', border: `1px solid ${GOLD}44`,
              borderRadius: 10, color: muted ? GOLD_INK : GOLD,
              width: 40, height: 40, fontSize: 16, cursor: 'pointer',
            }}>{muted ? '♪̸' : '♪'}</button>
          )}

          <button onClick={onCashier} className="kf-tap" title="Cashier" style={{
            background: 'linear-gradient(180deg, #f8d070 0%, #d4a437 55%, #7a5a10 100%)',
            border: '1px solid rgba(255,220,120,0.55)',
            borderRadius: 12, padding: isMobile ? '8px 10px' : '10px 20px',
            color: '#20140a', fontFamily: HEADING, fontSize: isMobile ? 11 : 12,
            letterSpacing: '0.2em', fontWeight: 900, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            boxShadow: '0 8px 22px rgba(240,192,64,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            <span style={{ fontSize: 14 }}>💼</span>
            {!isMobile && 'CASHIER'}
          </button>
        </div>
      </div>

      {isMobile ? (
        <div style={{ flex: 1, paddingBottom: `calc(84px + var(--kf-safe-bottom))` }}>{children}</div>
      ) : (
        <div style={{
          flex: 1,
          display: 'grid', gridTemplateColumns: '260px 1fr', gap: 18,
          padding: '18px 20px 0',
        }}>
          <div style={{ position: 'sticky', top: 76, alignSelf: 'start', maxHeight: 'calc(100dvh - 90px)', overflowY: 'auto' }}>
            {Sidebar}
          </div>
          <div>{children}</div>
        </div>
      )}

      {/* Mobile bottom tab bar — floating, hides on scroll-down */}
      {isMobile && (
        <div className="kf-glass" style={{
          position: 'fixed',
          left: 12, right: 12,
          bottom: `calc(12px + var(--kf-safe-bottom))`,
          zIndex: 50,
          border: '1px solid rgba(240,192,64,0.28)',
          borderRadius: 20,
          padding: '6px 6px',
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2,
          boxShadow: '0 14px 40px rgba(0,0,0,0.65), 0 0 20px rgba(240,192,64,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
          transform: tabBarVisible ? 'translateY(0)' : 'translateY(calc(100% + 24px))',
          opacity: tabBarVisible ? 1 : 0,
          transition: 'transform 0.28s cubic-bezier(0.2,1.1,0.4,1), opacity 0.22s ease',
          pointerEvents: tabBarVisible ? 'auto' : 'none',
        }}>
          {([
            { key: 'lobby',    icon: '⌂', label: 'LOBBY',    nav: 'play' as NavKey,        big: false, action: () => handleNav('play') },
            { key: 'missions', icon: '♛', label: 'MISSIONS', nav: 'missions' as NavKey,    big: false, action: () => handleNav('missions') },
            { key: 'quick',    icon: '♟', label: 'QUICK',    nav: 'play' as NavKey,        big: true,  action: () => { onSfx?.('chipClick'); onQuickPlay?.(); } },
            { key: 'jackpots', icon: '★', label: 'JACKPOTS', nav: 'promotions' as NavKey,  big: false, action: () => handleNav('promotions') },
            { key: 'profile',  icon: '☺', label: 'PROFILE',  nav: 'vip' as NavKey,         big: false, action: () => handleNav('vip') },
          ]).map(t => {
            const active = currentNav === t.nav || (t.big && currentNav === 'play');
            return (
              <button
                key={t.key}
                onClick={t.action}
                className="kf-tap"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 2, padding: t.big ? '6px 4px' : '8px 4px',
                  background: t.big
                    ? 'radial-gradient(circle at 50% 20%, rgba(240,192,64,0.35), rgba(80,60,20,0.6))'
                    : active ? 'rgba(240,192,64,0.10)' : 'transparent',
                  border: t.big ? `1px solid ${GOLD}55` : 'none',
                  borderRadius: t.big ? 14 : 8,
                  color: active || t.big ? GOLD : 'rgba(200,190,170,0.65)',
                  cursor: 'pointer', minHeight: 52,
                  marginTop: t.big ? -14 : 0,
                  boxShadow: t.big ? '0 4px 16px rgba(240,192,64,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                }}
              >
                <span style={{ fontSize: t.big ? 22 : 18 }}>{t.icon}</span>
                <span style={{ ...cap(7, '0.18em'), color: 'inherit' }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="kf-safe-bottom" style={{ padding: isMobile ? '8px 8px 10px' : '14px 16px 18px', display: isMobile ? 'none' : 'block' }}>
        <div style={{
          background: 'linear-gradient(180deg, rgba(20,26,22,0.92), rgba(10,14,12,0.94))',
          border: '1px solid rgba(240,192,64,0.18)',
          borderRadius: 14, padding: isMobile ? '12px' : '16px',
          display: 'flex', gap: 20, justifyContent: 'space-around', flexWrap: 'wrap',
        }}>
          {[
            { icon: '🛡', label: 'SECURE & FAIR', sub: 'Provably fair gameplay' },
            { icon: '⚡', label: 'FAST PAYOUTS', sub: 'Instant withdrawals' },
            { icon: '🎧', label: '24/7 SUPPORT', sub: 'Live dealer assistance' },
          ].map(it => (
            <div key={it.label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(74,222,128,0.12)', border: `1px solid ${GREEN}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: GREEN, fontSize: 15,
              }}>{it.icon}</div>
              <div>
                <div style={{ ...cap(10, '0.22em', GREEN), fontWeight: 700 }}>{it.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 11, color: 'rgba(200,190,170,0.7)' }}>{it.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CasinoChrome;
