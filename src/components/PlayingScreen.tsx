import React, { useMemo } from 'react';
import Board from './Board';
import { GameState, Position } from '../types/checkers.types';
import {
  CHIP_SKINS, CHIP_SKIN_ORDER, ChipSkinDef, ChipSkinId,
  LevelConfig, PointsState, SIDE_BETS, SideBetId, SideBetState, VipTier,
} from '../types/game.types';
import { getPieceCounts } from '../utils/checkersEngine';
import { DailyBonusStatus } from '../hooks/usePoints';

const GOLD = '#f8ce55';
const GOLD_INK = '#c0a870';
const GREEN = '#5ee88f';
const RED = '#ff5a6c';
const CREAM = '#f5ecd6';
const PANEL_BG = 'linear-gradient(180deg, rgba(34,42,36,0.94) 0%, rgba(20,26,22,0.96) 100%)';
const PANEL_BORDER = '1px solid rgba(248,206,85,0.28)';
const PANEL_BORDER_STRONG = '1px solid rgba(248,206,85,0.5)';
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

const StakeInfoCard: React.FC<{ cost: number; reward: number }> = ({ cost, reward }) => (
  <Panel style={{ padding: 12, minWidth: 0 }}>
    <div style={cinzel(9, '0.28em', GOLD_INK)}>STAKE · REWARD</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={cinzel(8, '0.18em', GOLD_INK)}>BUY-IN</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 900, color: GOLD, marginTop: 2 }}>{cost}</div>
      </div>
      <div style={{ width: 1, height: 26, background: 'rgba(240,192,64,0.25)' }} />
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={cinzel(8, '0.18em', GOLD_INK)}>PAYS</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 900, color: GREEN, marginTop: 2 }}>+{reward}</div>
      </div>
    </div>
  </Panel>
);

const actionBtn = (accent: string, active = false): React.CSSProperties => ({
  padding: '10px 4px', borderRadius: 8, cursor: 'pointer',
  background: active
    ? `linear-gradient(180deg, ${accent}44, ${accent}18)`
    : 'rgba(255,255,255,0.03)',
  border: `1px solid ${active ? accent : 'rgba(255,255,255,0.06)'}`,
  color: active ? accent : CREAM,
  fontFamily: HEADING, fontSize: 9, letterSpacing: '0.18em', fontWeight: 700,
  minHeight: 52,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
});

const GameActionsCard: React.FC<{
  muted: boolean; ambientOn: boolean;
  onMute: () => void; onAmbient: () => void;
  onHint: () => void;
  onFold: () => void;
  hintDisabled: boolean; foldDisabled: boolean;
}> = ({ muted, ambientOn, onMute, onAmbient, onHint, onFold, hintDisabled, foldDisabled }) => (
  <Panel style={{ padding: 12, minWidth: 0 }}>
    <div style={cinzel(9, '0.28em', GOLD_INK)}>QUICK ACTIONS</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6, marginTop: 10 }}>
      <button className="kf-tap" style={actionBtn(GOLD, !muted)} onClick={onMute}>
        <span style={{ fontSize: 16 }}>{muted ? '♪̸' : '♪'}</span>
        <span>{muted ? 'MUTED' : 'SOUND'}</span>
      </button>
      <button className="kf-tap" style={actionBtn('#7ce6ff', ambientOn)} onClick={onAmbient}>
        <span style={{ fontSize: 16 }}>{ambientOn ? '◉' : '○'}</span>
        <span>AMBIENT</span>
      </button>
      <button
        className="kf-tap"
        style={{ ...actionBtn(GREEN), opacity: hintDisabled ? 0.4 : 1, cursor: hintDisabled ? 'not-allowed' : 'pointer' }}
        onClick={() => { if (!hintDisabled) onHint(); }}
        disabled={hintDisabled}
      >
        <span style={{ fontSize: 16 }}>✦</span>
        <span>HINT</span>
      </button>
      <button
        className="kf-tap"
        style={{
          ...actionBtn(RED, true),
          background: foldDisabled
            ? 'rgba(80,20,25,0.35)'
            : 'linear-gradient(180deg, rgba(255,90,108,0.38), rgba(120,20,32,0.6))',
          borderColor: foldDisabled ? 'rgba(255,90,108,0.2)' : RED,
          color: foldDisabled ? 'rgba(255,90,108,0.45)' : '#fff',
          opacity: foldDisabled ? 0.55 : 1,
          cursor: foldDisabled ? 'not-allowed' : 'pointer',
          boxShadow: foldDisabled ? 'none' : '0 6px 18px rgba(255,90,108,0.32)',
        }}
        onClick={() => { if (!foldDisabled) onFold(); }}
        disabled={foldDisabled}
      >
        <span style={{ fontSize: 16 }}>⚑</span>
        <span>FOLD</span>
      </button>
    </div>
  </Panel>
);

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
    muted, ambientOn,
    onSelectSquare, onResign, onEquipSkin, onSfx,
    onToggleMute, onToggleAmbient, onGoToLobby,
  } = p;

  const BackBar: React.FC = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, padding: '2px 2px 4px', width: '100%',
    }}>
      <button
        onClick={() => { onSfx('chipClick'); onGoToLobby(); }}
        className="kf-tap"
        aria-label="Back to lobby"
        style={{
          width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
          background: 'rgba(240,192,64,0.10)',
          border: `1px solid ${GOLD}44`,
          color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div style={{
        padding: '8px 20px', borderRadius: 999,
        background: PANEL_BG, border: PANEL_BORDER,
      }}>
        <div style={{
          fontFamily: HEADING, fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', color: GOLD,
        }}>{config.label} · {config.tagline}</div>
      </div>
      <div style={{ width: 40, height: 40 }} />
    </div>
  );

  const handleHint = React.useCallback(() => {
    onSfx('chipClick');
    if (gameState.isGameOver) return;
    if (gameState.currentTurn !== 'red') return;
    const move = gameState.allLegalMoves[0];
    if (move) onSelectSquare(move.from);
  }, [gameState, onSelectSquare, onSfx]);

  const hintDisabled = gameState.isGameOver
    || gameState.currentTurn !== 'red'
    || isAIThinking
    || gameState.allLegalMoves.length === 0;

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
        <BackBar />
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
        <GameActionsCard
          muted={muted} ambientOn={ambientOn}
          onMute={onToggleMute} onAmbient={onToggleAmbient}
          onHint={handleHint}
          onFold={onResign}
          hintDisabled={hintDisabled}
          foldDisabled={gameState.isGameOver}
        />
        <StakeInfoCard cost={config.cost} reward={config.reward} />
        <GameHistoryCard moves={movePairs} />
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
          <StakeInfoCard cost={config.cost} reward={config.reward} />
          <ChipThemesCard activeId={activeSkinId} unlocked={unlockedSkins} onEquip={onEquipSkin} onSfx={onSfx} />
          <GameActionsCard
            muted={muted} ambientOn={ambientOn}
            onMute={onToggleMute} onAmbient={onToggleAmbient}
            onHint={handleHint}
            onFold={onResign}
            hintDisabled={hintDisabled}
            foldDisabled={gameState.isGameOver}
          />
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
      </div>
    </div>
  );
};

export default PlayingScreen;
