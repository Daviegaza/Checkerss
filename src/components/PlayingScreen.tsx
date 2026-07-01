import React, { useMemo } from 'react';
import Board from './Board';
import { GameState, Position } from '../types/checkers.types';
import {
  CHIP_SKINS, CHIP_SKIN_ORDER, ChipSkinDef, ChipSkinId,
  LevelConfig, PointsState, SIDE_BETS, SideBetId, SideBetState, VipTier,
} from '../types/game.types';
import { getPieceCounts } from '../utils/checkersEngine';
import { DailyBonusStatus } from '../hooks/usePoints';

const GOLD = '#f0c040';
const GOLD_INK = '#8a7a4a';
const GREEN = '#4ade80';
const RED = '#f04d5c';
const CREAM = '#f0e6cf';
const PANEL_BG = 'linear-gradient(180deg, rgba(20,26,22,0.92) 0%, rgba(10,14,12,0.94) 100%)';
const PANEL_BORDER = '1px solid rgba(240,192,64,0.18)';
const PANEL_BORDER_STRONG = '1px solid rgba(240,192,64,0.32)';
const HEADING = "'Cinzel', serif";
const DISPLAY = "'Playfair Display', serif";
const BODY = "'Crimson Pro', serif";

const cinzel = (size = 10, letterSpacing = '0.18em', color = GOLD_INK) => ({
  fontFamily: HEADING, fontSize: size, letterSpacing, color,
  textTransform: 'uppercase' as const,
});

export interface PlayingScreenProps {
  gameState: GameState;
  config: LevelConfig;
  isAIThinking: boolean;
  isMobile: boolean;
  isTablet: boolean;
  squareSize: number;
  boardPx: number;

  points: PointsState;
  tier: VipTier;
  activeSkin: ChipSkinDef;
  activeSkinId: ChipSkinId;
  unlockedSkins: ChipSkinId[];

  muted: boolean;
  ambientOn: boolean;
  dailyBonus: DailyBonusStatus;
  missionsCount: number;
  sessionLabel: string;
  sideBetState: SideBetState;

  onSelectSquare: (pos: Position) => void;
  onResign: () => void;
  onToggleMute: () => void;
  onToggleAmbient: () => void;
  onGoToLobby: () => void;
  onEquipSkin: (id: ChipSkinId) => void;
  onClaimDaily: () => void;
  onSfx: (name: 'chipClick' | 'hover') => void;
}

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; strong?: boolean }> =
  ({ children, style, strong }) => (
    <div style={{
      background: PANEL_BG,
      border: strong ? PANEL_BORDER_STRONG : PANEL_BORDER,
      borderRadius: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)',
      ...style,
    }}>{children}</div>
  );

const HairlineDivider: React.FC = () => (
  <div style={{
    height: 1,
    background: 'linear-gradient(90deg, transparent 0%, rgba(240,192,64,0.35) 50%, transparent 100%)',
    margin: '4px 0',
  }} />
);

const BoardShell: React.FC<{
  gameState: GameState;
  config: LevelConfig;
  onSelectSquare: (pos: Position) => void;
  isAITurn: boolean;
  isAIThinking: boolean;
  squareSize: number;
  boardPx: number;
  activeSkinId: ChipSkinId;
}> = ({ gameState, config, onSelectSquare, isAITurn, isAIThinking, squareSize, boardPx, activeSkinId }) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const isSmall = squareSize < 55;
  const railSize = isSmall ? 14 : 22;
  const padSize = isSmall ? 6 : 20;
  return (
    <div className="kf-board-halo kf-slide-up" style={{ maxWidth: '100%' }}><Panel style={{
      padding: padSize,
      background:
        'radial-gradient(ellipse at 50% 0%, rgba(240,192,64,0.06) 0%, transparent 55%),' +
        'linear-gradient(180deg, rgba(15,20,17,0.95), rgba(6,10,8,0.98))',
      border: '1px solid rgba(240,192,64,0.28)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(240,192,64,0.08)',
    }} strong>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        paddingBottom: 12, marginBottom: 12,
        borderBottom: '1px solid rgba(240,192,64,0.14)',
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: HEADING, fontSize: 16, letterSpacing: '0.28em', color: CREAM, fontWeight: 700 }}>
            {config.label} ROOM
          </div>
          <div style={cinzel(9, '0.14em', GOLD_INK)}>Min Bet: {config.cost} · Max Bet: {config.cost * 100}</div>
        </div>
        {isAIThinking && (
          <div style={{
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(124,211,252,0.12)', border: '1px solid rgba(124,211,252,0.35)',
            color: '#7dd3fc', fontFamily: HEADING, fontSize: 9, letterSpacing: '0.2em', fontWeight: 700,
          }}>HOUSE THINKING…</div>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${railSize}px 1fr`,
        gridTemplateRows: `1fr ${railSize}px`, gap: 6,
      }}>
        <div style={{ display: 'grid', gridTemplateRows: `repeat(8, ${squareSize}px)`, alignItems: 'center', justifyItems: 'center' }}>
          {rows.map(r => <div key={r} style={cinzel(11, '0.1em', GOLD_INK)}>{r}</div>)}
        </div>
        <div style={{ width: boardPx, justifySelf: 'center' }}>
          <Board
            gameState={gameState}
            onSquareClick={onSelectSquare}
            isAITurn={isAITurn}
            squareSize={squareSize}
            skinId={activeSkinId}
          />
        </div>
        <div />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(8, ${squareSize}px)`, justifyContent: 'center' }}>
          {cols.map(c => (
            <div key={c} style={{ ...cinzel(11, '0.14em', GOLD_INK), textAlign: 'center', paddingTop: 4 }}>{c}</div>
          ))}
        </div>
      </div>
    </Panel></div>
  );
};

const betStep = (): React.CSSProperties => ({
  width: 40, height: 40, borderRadius: 10,
  background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.35)',
  color: GOLD, fontSize: 20, fontWeight: 700,
  cursor: 'pointer', fontFamily: DISPLAY, minWidth: 40, flexShrink: 0,
});

const BetAmountCard: React.FC<{ bet: number; onSfx: (n: 'chipClick' | 'hover') => void }> = ({ bet, onSfx }) => {
  const [amt, setAmt] = React.useState(bet);
  React.useEffect(() => setAmt(bet), [bet]);
  const step = (d: number) => {
    onSfx('chipClick');
    setAmt(a => Math.max(1, a + d));
  };
  return (
    <Panel style={{ padding: 12, minWidth: 0 }}>
      <div style={cinzel(9, '0.28em', GOLD_INK)}>BET AMOUNT</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <button className="kf-tap" style={betStep()} onClick={() => step(-1)}>−</button>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 900, color: CREAM, overflow: 'hidden', textOverflow: 'ellipsis' }}>{amt}</span>
          <span style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            background: 'radial-gradient(circle at 30% 30%, #f8d070, #7a5a10)',
            border: '1px solid rgba(255,220,120,0.6)',
          }} />
        </div>
        <button className="kf-tap" style={betStep()} onClick={() => step(1)}>+</button>
      </div>
    </Panel>
  );
};

const ChipThemesCard: React.FC<{
  activeId: ChipSkinId; unlocked: ChipSkinId[]; onEquip: (id: ChipSkinId) => void;
  onSfx: (n: 'chipClick' | 'hover') => void;
}> = ({ activeId, unlocked, onEquip, onSfx }) => (
  <Panel style={{ padding: 14 }}>
    <div style={cinzel(9, '0.28em', GOLD_INK)}>CHIP THEMES</div>
    <div className="kf-scroll-x" style={{ display: 'flex', gap: 10, marginTop: 10 }}>
      {CHIP_SKIN_ORDER.map(id => {
        const skin = CHIP_SKINS[id];
        const isUnlocked = unlocked.includes(id);
        const isActive = activeId === id;
        return (
          <button
            key={id}
            onClick={() => { if (isUnlocked) { onSfx('chipClick'); onEquip(id); } else { onSfx('hover'); } }}
            title={skin.label}
            className="kf-tap kf-snap"
            style={{
              flex: '0 0 auto',
              width: 52, height: 52, borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${skin.playerColor}, ${skin.boardDark})`,
              border: isActive ? `2px solid ${GOLD}` : `2px solid ${isUnlocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
              cursor: 'pointer',
              opacity: isUnlocked ? 1 : 0.35,
              boxShadow: isActive
                ? `0 0 0 3px rgba(240,192,64,0.18), 0 4px 12px ${skin.playerColor}66`
                : 'inset 0 -2px 4px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.4)',
            }}
          />
        );
      })}
    </div>
  </Panel>
);

const QuickBetCard: React.FC<{ current: number; onSfx: (n: 'chipClick' | 'hover') => void }> = ({ current, onSfx }) => {
  const opts = [10, 20, 50, 100];
  const [pick, setPick] = React.useState(current);
  React.useEffect(() => setPick(current), [current]);
  return (
    <Panel style={{ padding: 12, minWidth: 0 }}>
      <div style={cinzel(9, '0.28em', GOLD_INK)}>QUICK BET</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 4, marginTop: 10,
      }}>
        {opts.map(v => {
          const active = v === pick;
          return (
            <button key={v} onClick={() => { onSfx('chipClick'); setPick(v); }} className="kf-tap" style={{
              minWidth: 0, width: '100%', textAlign: 'center',
              padding: '10px 2px', borderRadius: 8,
              background: active
                ? 'linear-gradient(180deg, rgba(240,192,64,0.28), rgba(240,192,64,0.08))'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? GOLD : 'rgba(255,255,255,0.06)'}`,
              color: active ? GOLD : CREAM,
              fontFamily: DISPLAY, fontWeight: 800, fontSize: 13,
              cursor: 'pointer', minHeight: 48,
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{v}</button>
          );
        })}
      </div>
    </Panel>
  );
};

const CurrentGameCard: React.FC<{ config: LevelConfig; sessionLabel: string }> = ({ config, sessionLabel }) => (
  <Panel style={{ padding: 16 }}>
    <div style={cinzel(9, '0.28em', GREEN)}>CURRENT GAME</div>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: config.gradient,
        border: `1px solid ${config.color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: config.color, fontSize: 18,
      }}>♛</div>
      <div>
        <div style={{ fontFamily: HEADING, fontSize: 13, letterSpacing: '0.22em', color: CREAM, fontWeight: 700 }}>
          {config.label} ROOM
        </div>
        <div style={cinzel(9, '0.14em', GOLD_INK)}>{sessionLabel} · {config.reward} per win</div>
      </div>
    </div>
  </Panel>
);

const ScoreCard: React.FC<{ you: number; house: number }> = ({ you, house }) => (
  <Panel style={{ padding: 16 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={cinzel(9, '0.22em', GREEN)}>YOU</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 900, color: CREAM, lineHeight: 1, marginTop: 4 }}>{you}</div>
      </div>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', border: `1px solid ${GOLD}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: GOLD, fontFamily: HEADING, fontSize: 11, letterSpacing: '0.1em',
      }}>VS</div>
      <div style={{ textAlign: 'center' }}>
        <div style={cinzel(9, '0.22em', RED)}>HOUSE</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 900, color: CREAM, lineHeight: 1, marginTop: 4 }}>{house}</div>
      </div>
    </div>
  </Panel>
);

const TurnBanner: React.FC<{ isYou: boolean; isAIThinking: boolean; isGameOver: boolean; winner: string | null }> =
  ({ isYou, isAIThinking, isGameOver, winner }) => {
    let label = 'YOUR TURN';
    let sub = 'Make your move';
    let bg = 'linear-gradient(180deg, rgba(74,222,128,0.32), rgba(20,80,45,0.5))';
    let border = 'rgba(74,222,128,0.5)';
    let color = GREEN;
    if (isGameOver) {
      if (winner === 'red') { label = 'VICTORY'; sub = 'You cleared the felt'; }
      else if (winner === 'black') {
        label = 'HOUSE WINS'; sub = 'Round to the house';
        bg = 'linear-gradient(180deg, rgba(240,77,92,0.32), rgba(80,20,30,0.5))';
        border = 'rgba(240,77,92,0.5)'; color = RED;
      } else {
        label = 'DRAW'; sub = 'A tied hand';
        bg = 'linear-gradient(180deg, rgba(240,192,64,0.28), rgba(80,60,20,0.5))';
        border = 'rgba(240,192,64,0.5)'; color = GOLD;
      }
    } else if (isAIThinking || !isYou) {
      label = 'HOUSE PLAY';
      sub = isAIThinking ? 'Thinking…' : 'Awaiting move';
      bg = 'linear-gradient(180deg, rgba(240,77,92,0.28), rgba(60,20,30,0.5))';
      border = 'rgba(240,77,92,0.4)'; color = RED;
    }
    const pulseClass = isGameOver ? '' : (isYou ? 'kf-pulse-green' : 'kf-pulse-red');
    return (
      <div className={`kf-slide-up ${pulseClass}`} style={{
        padding: '12px 12px', textAlign: 'center',
        background: bg, border: `1px solid ${border}`, borderRadius: 14,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: HEADING, fontSize: 15, letterSpacing: '0.22em',
          color, fontWeight: 900, textShadow: `0 0 14px ${border}`,
        }}>{label}</div>
        <div style={{ fontFamily: BODY, fontSize: 11, color: CREAM, opacity: 0.85, marginTop: 3 }}>{sub}</div>
      </div>
    );
  };

const GameHistoryCard: React.FC<{ moves: { num: number; red?: string; black?: string }[] }> = ({ moves }) => (
  <Panel style={{ padding: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <div style={cinzel(9, '0.28em', GREEN)}>GAME HISTORY</div>
      <div style={{ ...cinzel(9, '0.14em', GOLD_INK), whiteSpace: 'nowrap' }}>Last 10</div>
    </div>
    <HairlineDivider />
    <div style={{ maxHeight: 160, overflowY: 'auto', paddingRight: 4 }}>
      {moves.length === 0 ? (
        <div style={{ padding: '8px 0', color: GOLD_INK, fontFamily: BODY, fontSize: 12, fontStyle: 'italic' }}>
          <span style={{ color: GOLD, marginRight: 6 }}>◆</span>Awaiting first move…
        </div>
      ) : (
        moves.slice(-10).map(p => (
          <div key={p.num} style={{
            display: 'grid', gridTemplateColumns: '28px 1fr 1fr',
            gap: 8, padding: '6px 4px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            fontFamily: DISPLAY, fontSize: 12,
          }}>
            <span style={{ color: GOLD_INK }}>{p.num}.</span>
            <span style={{ color: GOLD }}>{p.red ?? '—'}</span>
            <span style={{ color: CREAM }}>{p.black ?? '—'}</span>
          </div>
        ))
      )}
    </div>
  </Panel>
);

const FoldButton: React.FC<{ onClick: () => void; disabled: boolean }> = ({ onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="kf-tap" style={{
    width: '100%', padding: '14px',
    background: disabled
      ? 'rgba(60,20,25,0.4)'
      : 'linear-gradient(180deg, rgba(140,30,45,0.45) 0%, rgba(80,15,25,0.7) 100%)',
    border: `1px solid ${disabled ? 'rgba(240,77,92,0.15)' : 'rgba(240,77,92,0.55)'}`,
    borderRadius: 12,
    color: disabled ? 'rgba(240,77,92,0.35)' : RED,
    fontFamily: HEADING, fontSize: 14, letterSpacing: '0.28em', fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
    boxShadow: disabled ? 'none' : '0 6px 18px rgba(240,77,92,0.25)',
    minHeight: 56,
  }}>
    <span>⚑</span> FOLD HAND
  </button>
);

const SideBetStrip: React.FC<{ sideBetState: SideBetState }> = ({ sideBetState }) => {
  const activeIds = (Object.keys(sideBetState.active) as SideBetId[]).filter(k => sideBetState.active[k]);
  if (activeIds.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {activeIds.map(id => {
        const b = SIDE_BETS[id];
        return (
          <div key={id} style={{
            display: 'flex', gap: 6, alignItems: 'center',
            padding: '5px 10px', borderRadius: 999,
            background: `linear-gradient(90deg, ${b.color}22, ${b.color}0a)`,
            border: `1px solid ${b.color}55`,
            fontFamily: HEADING, fontSize: 9, letterSpacing: '0.14em',
            color: b.color, fontWeight: 700,
          }}>
            <span style={{ fontSize: 10 }}>◆</span> {b.label.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};

const PlayingScreen: React.FC<PlayingScreenProps> = (p) => {
  const {
    gameState, config, isAIThinking, isMobile, isTablet, squareSize, boardPx,
    activeSkinId, unlockedSkins, sessionLabel, sideBetState,
    onSelectSquare, onResign, onEquipSkin, onSfx,
  } = p;

  const counts = useMemo(() => getPieceCounts(gameState.board), [gameState.board]);
  const movePairs = useMemo(() => {
    const arr: { num: number; red?: string; black?: string }[] = [];
    for (let i = 0; i < gameState.moveHistory.length; i += 2) {
      arr.push({
        num: Math.floor(i / 2) + 1,
        red: gameState.moveHistory[i]?.notation,
        black: gameState.moveHistory[i + 1]?.notation,
      });
    }
    return arr;
  }, [gameState.moveHistory]);

  const isAITurn = gameState.currentTurn === 'black' || isAIThinking;

  // ── Mobile / tablet: stacked ─────────────────────────────────────────────
  if (isMobile || isTablet) {
    return (
      <div style={{
        padding: '6px 6px 20px', display: 'flex', flexDirection: 'column', gap: 10,
        color: CREAM, width: '100%', maxWidth: '100%', overflowX: 'hidden', minWidth: 0,
        alignItems: 'stretch', justifyContent: 'flex-start', boxSizing: 'border-box',
      }}>
        <BoardShell
          gameState={gameState} config={config}
          onSelectSquare={onSelectSquare} isAITurn={isAITurn}
          isAIThinking={isAIThinking} squareSize={squareSize} boardPx={boardPx}
          activeSkinId={activeSkinId}
        />
        <SideBetStrip sideBetState={sideBetState} />
        <div className="kf-slide-up" style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.35fr)', gap: 8,
        }}>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
            padding: '10px 8px', borderRadius: 14,
            background: PANEL_BG, border: PANEL_BORDER,
          }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={cinzel(8, '0.22em', GREEN)}>YOU</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 900, color: CREAM, lineHeight: 1 }}>{counts.red}</div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: `1px solid ${GOLD}55`, color: GOLD,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: HEADING, fontSize: 9, letterSpacing: '0.1em',
            }}>VS</div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={cinzel(8, '0.22em', RED)}>HOUSE</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 900, color: CREAM, lineHeight: 1 }}>{counts.black}</div>
            </div>
          </div>
          <TurnBanner
            isYou={gameState.currentTurn === 'red' && !isAIThinking}
            isAIThinking={isAIThinking}
            isGameOver={gameState.isGameOver}
            winner={gameState.winner}
          />
        </div>
        <ChipThemesCard activeId={activeSkinId} unlocked={unlockedSkins} onEquip={onEquipSkin} onSfx={onSfx} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
          <BetAmountCard bet={config.cost} onSfx={onSfx} />
          <QuickBetCard current={config.cost} onSfx={onSfx} />
        </div>
        <GameHistoryCard moves={movePairs} />
        <FoldButton onClick={onResign} disabled={gameState.isGameOver} />
      </div>
    );
  }

  // ── Desktop: content lives inside CasinoChrome grid — center + right ────
  return (
    <div style={{
      color: CREAM,
      display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <BoardShell
          gameState={gameState} config={config}
          onSelectSquare={onSelectSquare} isAITurn={isAITurn}
          isAIThinking={isAIThinking} squareSize={squareSize} boardPx={boardPx}
          activeSkinId={activeSkinId}
        />
        <SideBetStrip sideBetState={sideBetState} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr 1.15fr', gap: 14 }}>
          <BetAmountCard bet={config.cost} onSfx={onSfx} />
          <ChipThemesCard activeId={activeSkinId} unlocked={unlockedSkins} onEquip={onEquipSkin} onSfx={onSfx} />
          <QuickBetCard current={config.cost} onSfx={onSfx} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <CurrentGameCard config={config} sessionLabel={sessionLabel} />
        <ScoreCard you={counts.red} house={counts.black} />
        <TurnBanner
          isYou={gameState.currentTurn === 'red' && !isAIThinking}
          isAIThinking={isAIThinking}
          isGameOver={gameState.isGameOver}
          winner={gameState.winner}
        />
        <GameHistoryCard moves={movePairs} />
        <FoldButton onClick={onResign} disabled={gameState.isGameOver} />
      </div>
    </div>
  );
};

export default PlayingScreen;
