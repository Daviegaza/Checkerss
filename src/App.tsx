import './App.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChipSkinId, CHIP_SKINS,
  DifficultyLevel, GameResult, GameScreen,
  JACKPOT_TIERS,
  LEVEL_CONFIGS, LevelConfig,
  makeInitialSideBetState, RoundMetricDelta,
  SideBetId, SideBetState,
  streakMultiplier, vipTierFor,
} from './types/game.types';
import { Board as BoardType } from './types/checkers.types';
import { createInitialBoard } from './utils/checkersEngine';
import { useCheckersGame } from './hooks/useCheckersGame';
import { useAI } from './hooks/useAI';
import { usePoints } from './hooks/usePoints';
import { useMissions } from './hooks/useMissions';
import { useSession } from './hooks/useSession';
import { useWindowSize } from './hooks/useWindowSize';
import { useSoundFX } from './hooks/useSoundFX';
import Board from './components/Board';
import GameStatus from './components/GameStatus';
import GameLobby from './components/GameLobby';
import GameResultScreen from './components/GameResultScreen';
import ChipCounter from './components/ChipCounter';
import ParticleBurst from './components/ParticleBurst';
import AgeGate from './components/AgeGate';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('lobby');
  const [activeConfig, setActiveConfig] = useState<LevelConfig>(LEVEL_CONFIGS.easy);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [sideBetState, setSideBetState] = useState<SideBetState>(makeInitialSideBetState);
  const [burstSeq, setBurstSeq] = useState<{ n: number; x: number; y: number; color: string; count: number }>({
    n: -1, x: 0, y: 0, color: '#f0c040', count: 30,
  });
  const resultHandled = useRef(false);

  const { width, isMobile, isTablet } = useWindowSize();
  const {
    points, dailyBonus,
    canAffordRound, placeRound, resolveRound,
    claimDailyBonus, resetPoints,
    equipSkin, acknowledgeAge, addChips,
  } = usePoints();
  const { gameState, selectSquare, applyExternalMove, resetGame } = useCheckersGame();
  const { muted, toggleMute, play, ambientOn, toggleAmbient } = useSoundFX();
  const missions = useMissions();
  const session = useSession();

  const activeSkin = CHIP_SKINS[points.activeSkin] || CHIP_SKINS.classic;
  const tier = vipTierFor(points.vipXp);

  // Auto-suggest skin on VIP tier increase — sticky flag prevents constant re-nag
  const notifiedTierRef = useRef<number>(tier.tier);
  useEffect(() => {
    if (tier.tier > notifiedTierRef.current) {
      notifiedTierRef.current = tier.tier;
      play('levelUp');
    }
  }, [tier.tier, play]);

  // ── Move-event tracking for side bets + interactive sfx + particle bursts ──
  const prevBoardRef = useRef<BoardType>(createInitialBoard());
  const prevMoveLenRef = useRef(0);
  const burstCounterRef = useRef(0);

  const fireBurst = useCallback((color: string, count = 30, x?: number, y?: number) => {
    burstCounterRef.current += 1;
    setBurstSeq({
      n: burstCounterRef.current,
      x: x ?? window.innerWidth / 2,
      y: y ?? window.innerHeight / 2,
      color,
      count,
    });
  }, []);

  useEffect(() => {
    if (screen !== 'playing') return;
    const { moveHistory, board } = gameState;
    const prevBoard = prevBoardRef.current;
    for (let i = prevMoveLenRef.current; i < moveHistory.length; i++) {
      const move = moveHistory[i].move;
      const moving = prevBoard[move.from.row][move.from.col];
      if (!moving) continue;
      const color = moving.color;
      const wasKing = moving.isKing;
      const capturedCount = move.captures.length;
      const backRankHit =
        (color === 'red' && move.to.row === 0) ||
        (color === 'black' && move.to.row === 7);
      const becameKing = !wasKing && backRankHit;

      setSideBetState(prev => {
        const next: SideBetState = { ...prev, active: { ...prev.active } };
        if (capturedCount > 0 && next.firstCapturePlayer === null) {
          next.firstCapturePlayer = color;
        }
        if (capturedCount > 0) {
          if (color === 'red') next.piecesCapturedByPlayer += capturedCount;
          else next.piecesLostByPlayer += capturedCount;
        }
        if (becameKing && color === 'red') next.playerKingsCrowned += 1;
        return next;
      });

      if (becameKing) {
        play('kingMe');
        if (color === 'red') fireBurst(activeSkin.playerColor, 40);
      } else if (capturedCount > 0) {
        play('capture');
        // small burst at center — position anchor lives on window since board coords are fluid
        fireBurst(color === 'red' ? '#f04d5c' : '#c8d0e0', 14);
      } else {
        play('move');
      }
    }
    prevMoveLenRef.current = moveHistory.length;
    prevBoardRef.current = board;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.moveHistory.length, screen]);

  // ── Responsive square size ─────────────────────────────────────────────────
  const squareSize = (() => {
    if (isMobile) return Math.floor((Math.min(width, 480) - 16) / 8);
    if (isTablet) return Math.floor((Math.min(width * 0.92, 560) - 16) / 8);
    return Math.min(72, Math.floor((width - 340) / 8));
  })();
  const boardPx = squareSize * 8;

  // ── Start / Rematch ────────────────────────────────────────────────────────
  const beginRound = useCallback((cfg: LevelConfig, betIds: SideBetId[]): boolean => {
    if (!canAffordRound(cfg, betIds)) { play('error'); return false; }
    if (!placeRound(cfg, betIds)) { play('error'); return false; }
    play('chipDrop');
    setActiveConfig(cfg);
    resultHandled.current = false;
    setGameResult(null);

    const fresh = makeInitialSideBetState();
    betIds.forEach(id => { fresh.active[id] = true; });
    setSideBetState(fresh);
    prevMoveLenRef.current = 0;
    prevBoardRef.current = createInitialBoard();

    resetGame();
    setScreen('playing');
    return true;
  }, [canAffordRound, placeRound, play, resetGame]);

  const handleStartGame = useCallback((level: DifficultyLevel, betIds: SideBetId[]) => {
    beginRound(LEVEL_CONFIGS[level], betIds);
  }, [beginRound]);

  // ── AI ─────────────────────────────────────────────────────────────────────
  const handleAIMove = useCallback((move: Parameters<typeof applyExternalMove>[0]) => {
    applyExternalMove(move);
  }, [applyExternalMove]);

  const handleThinkingChange = useCallback((t: boolean) => setIsAIThinking(t), []);

  useAI({
    gameState,
    aiColor: 'black',
    difficulty: activeConfig.level,
    enabled: screen === 'playing' && !gameState.isGameOver,
    onMoveMade: handleAIMove,
    onThinkingChange: handleThinkingChange,
  });

  // ── Mission bonus router — called by usePoints during resolveRound ─────────
  const onMetricsCallback = useCallback(
    (delta: RoundMetricDelta, missionBonus: (chips: number) => void) => {
      const { justCompleted } = missions.applyDelta(delta);
      if (justCompleted.length > 0) {
        // Immediately claim so player sees +chips on the result screen
        justCompleted.forEach(m => {
          const reward = missions.claim(m.templateId);
          if (reward > 0) missionBonus(reward);
        });
        play('missionComplete');
      }
    },
    [missions, play]
  );

  // ── Detect Game Over ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameState.isGameOver || screen !== 'playing' || resultHandled.current) return;
    resultHandled.current = true;

    let type: GameResult['type'];
    let reason: string;
    if (gameState.winner === 'red') {
      type = 'player_win';
      reason = 'You cleared the felt — the kingdom is yours.';
    } else if (gameState.winner === 'black') {
      type = 'computer_win';
      reason = 'The house takes the round.';
    } else {
      type = 'draw';
      reason = 'Eighty quiet moves — the round is drawn.';
    }

    const outcome = resolveRound(type, activeConfig, sideBetState, onMetricsCallback);
    outcome.reason = reason;
    setGameResult(outcome);

    // Sound + burst based on outcome
    if (outcome.jackpotHit && outcome.jackpotTierHit) {
      const tid = outcome.jackpotTierHit;
      const map = { mini: 'jackpotMini', minor: 'jackpotMinor', major: 'jackpotMajor', grand: 'jackpotGrand' } as const;
      play(map[tid]);
      fireBurst(JACKPOT_TIERS[tid].color, 80);
    } else if (type === 'player_win') {
      play('win');
      fireBurst(activeSkin.playerColor, 55);
    } else if (type === 'draw') {
      play('draw');
    } else {
      play('lose');
    }

    setTimeout(() => setScreen('result'), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.isGameOver, gameState.winner, screen, resolveRound, activeConfig, sideBetState]);

  // ── Resign ─────────────────────────────────────────────────────────────────
  const handleResign = useCallback(() => {
    if (resultHandled.current) return;
    resultHandled.current = true;
    const outcome = resolveRound('computer_win', activeConfig, sideBetState, onMetricsCallback);
    outcome.reason = 'You resigned — the house takes it.';
    setGameResult(outcome);
    play('lose');
    setScreen('result');
  }, [resolveRound, activeConfig, sideBetState, onMetricsCallback, play]);

  // ── Rematch ────────────────────────────────────────────────────────────────
  const activeBetIds = useMemo<SideBetId[]>(
    () => (Object.keys(sideBetState.active) as SideBetId[]).filter(k => sideBetState.active[k]),
    [sideBetState.active]
  );

  const handlePlayAgain = useCallback(() => {
    const ok = beginRound(activeConfig, activeBetIds);
    if (!ok) setScreen('lobby');
  }, [beginRound, activeConfig, activeBetIds]);

  // ── SFX bridges for children ───────────────────────────────────────────────
  const lobbySfx = useCallback(
    (n: 'chipClick' | 'coin' | 'error' | 'missionComplete' | 'skinUnlock' | 'hover') => play(n),
    [play]
  );
  const resultSfx = useCallback(
    (n: 'chipClick' | 'win' | 'lose' | 'draw' | 'jackpot' | 'coin' | 'kingMe') => play(n),
    [play]
  );

  const handleClaimDaily = useCallback(() => {
    const gained = claimDailyBonus();
    if (gained > 0) {
      play('coinShower');
      fireBurst('#f0c040', 40);
    }
  }, [claimDailyBonus, play, fireBurst]);

  const handleClaimMission = useCallback((templateId: string) => {
    const reward = missions.claim(templateId);
    if (reward > 0) {
      addChips(reward);
      play('missionComplete');
      fireBurst('#c07ce6', 35);
    }
  }, [missions, addChips, play, fireBurst]);

  // ── Age gate blocks all screens until acknowledged ─────────────────────────
  if (!points.ageAcknowledged) {
    return <AgeGate onAcknowledge={acknowledgeAge} />;
  }

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    return (
      <>
        <GameLobby
          points={points}
          dailyBonus={dailyBonus}
          muted={muted}
          ambientOn={ambientOn}
          onClaimDailyBonus={handleClaimDaily}
          onStartGame={handleStartGame}
          onResetPoints={resetPoints}
          onToggleMute={toggleMute}
          onToggleAmbient={toggleAmbient}
          onSfx={lobbySfx}
          missions={missions.state}
          onClaimMission={handleClaimMission}
          activeSkin={points.activeSkin}
          unlockedSkins={points.unlockedSkins}
          onEquipSkin={(id: ChipSkinId) => { play('skinUnlock'); equipSkin(id); }}
          sessionLabel={session.elapsedLabel}
        />
        <ParticleBurst trigger={burstSeq.n} x={burstSeq.x} y={burstSeq.y} color={burstSeq.color} count={burstSeq.count} />
        {session.activeNudge && (
          <CoolOffNudge minutes={session.activeNudge} onDismiss={session.dismissNudge} />
        )}
      </>
    );
  }

  if (screen === 'result' && gameResult) {
    return (
      <>
        <GameResultScreen
          result={gameResult} config={activeConfig} points={points}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={() => setScreen('lobby')}
          onSfx={resultSfx}
        />
        <ParticleBurst trigger={burstSeq.n} x={burstSeq.x} y={burstSeq.y} color={burstSeq.color} count={burstSeq.count} />
      </>
    );
  }

  // ── Playing Screen ─────────────────────────────────────────────────────────
  const curMult = streakMultiplier(points.winStreak);
  // Screen bg pulses toward active-skin palette as player levels — subtle
  const playingBg =
    `radial-gradient(ellipse at 20% 5%, ${activeSkin.playerColor}33 0%, transparent 55%),` +
    `radial-gradient(ellipse at 85% 15%, ${activeSkin.houseColor}28 0%, transparent 55%),` +
    'radial-gradient(ellipse at 10% 95%, rgba(192,124,230,0.18) 0%, transparent 55%),' +
    'radial-gradient(ellipse at 90% 88%, rgba(240,77,92,0.22) 0%, transparent 55%),' +
    'linear-gradient(180deg, #1a3245 0%, #142230 45%, #0e1a26 100%)';

  return (
    <>
      <div style={{
        minHeight: '100vh', background: playingBg,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: isMobile ? '10px 8px 20px' : '18px 16px 32px',
        gap: isMobile ? 10 : 16, boxSizing: 'border-box',
        overflowX: 'hidden', color: '#f0e6cf',
      }}>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', maxWidth: isMobile ? '100%' : boardPx + 280, gap: 10, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.4em', color: '#8a7a4a', fontFamily: "'Cinzel', serif" }}>
              HOUSE OF
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 20 : 24, fontWeight: 900, letterSpacing: '0.08em',
              background: 'linear-gradient(180deg, #fce49a 0%, #f0c040 55%, #7a5a10 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>KINGFALL</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {points.winStreak > 0 && (
              <Pill color="#f04d5c" icon="🔥" label={`${points.winStreak}× streak`} sub={`×${curMult.toFixed(2)}`} isMobile={isMobile} />
            )}
            <Pill color="#ff8ea0" icon="★" label="JACKPOT" sub={points.jackpot.toLocaleString()} isMobile={isMobile} />
            <div title={`Session ${session.elapsedLabel}`} style={{
              background: 'linear-gradient(135deg, rgba(124,230,255,0.15), rgba(20,60,80,0.5))',
              border: '1px solid rgba(124,230,255,0.35)',
              borderRadius: 999, padding: isMobile ? '4px 10px' : '6px 12px',
              fontFamily: "'Cinzel', serif", fontSize: 10, color: '#7ce6ff', letterSpacing: '0.15em',
            }}>{session.elapsedLabel}</div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30,25,10,0.9), rgba(15,12,5,0.9))',
              border: '1px solid rgba(240,192,64,0.3)',
              borderRadius: 10, padding: isMobile ? '6px 10px' : '8px 14px',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span style={{ color: '#8a7a4a', fontSize: 9, letterSpacing: '0.15em', fontFamily: "'Cinzel', serif" }}>
                CHIPS
              </span>
              <ChipCounter value={points.balance} color="#f0c040" size={isMobile ? 16 : 20} />
            </div>
            <button
              onClick={() => { play('chipClick'); toggleMute(); }}
              title={muted ? 'Unmute' : 'Mute'}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(240,192,64,0.25)',
                borderRadius: 10, color: muted ? '#8a7a4a' : '#f0c040',
                width: 36, height: 36, fontSize: 15, cursor: 'pointer',
              }}
            >{muted ? '♪̸' : '♪'}</button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: isMobile || isTablet ? 'column' : 'row',
          alignItems: isMobile || isTablet ? 'center' : 'flex-start',
          gap: isMobile ? 10 : 20,
          width: '100%',
          maxWidth: isMobile ? '100%' : boardPx + 280,
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
              background: 'linear-gradient(135deg, rgba(20,20,25,0.7), rgba(10,10,12,0.7))',
              border: '1px solid rgba(200,208,224,0.15)', borderRadius: 8,
            }}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                background: isAIThinking ? '#7dd3fc' : gameState.currentTurn === 'black' ? activeSkin.houseColor : '#3a3a4a',
                boxShadow: isAIThinking ? '0 0 10px #7dd3fc' : gameState.currentTurn === 'black' ? `0 0 8px ${activeSkin.houseColor}` : 'none',
                transition: 'all 0.3s ease',
              }} />
              <span style={{ color: '#a8a0b8', fontSize: 10, letterSpacing: '0.12em', fontFamily: "'Cinzel', serif" }}>
                {isAIThinking ? 'HOUSE thinking…' : `HOUSE · ${activeConfig.label}`}
              </span>
            </div>

            <Board
              gameState={gameState}
              onSquareClick={selectSquare}
              isAITurn={gameState.currentTurn === 'black' || isAIThinking}
              squareSize={squareSize}
              skinId={points.activeSkin}
            />

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
              background: 'linear-gradient(135deg, rgba(45,10,30,0.6), rgba(20,5,15,0.6))',
              border: `1px solid ${activeSkin.playerColor}44`, borderRadius: 8,
            }}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                background: gameState.currentTurn === 'red' ? activeSkin.playerColor : '#3a3a4a',
                boxShadow: gameState.currentTurn === 'red' ? `0 0 10px ${activeSkin.playerColor}` : 'none',
                transition: 'all 0.3s ease',
              }} />
              <span style={{ color: activeSkin.playerColor, fontSize: 10, letterSpacing: '0.12em', fontFamily: "'Cinzel', serif" }}>
                YOU · {tier.label.toUpperCase()}
              </span>
            </div>
          </div>

          <GameStatus
            gameState={gameState}
            config={activeConfig}
            isAIThinking={isAIThinking}
            onResign={handleResign}
            isMobile={isMobile || isTablet}
            boardWidth={boardPx}
            sideBetState={sideBetState}
          />
        </div>
      </div>

      <ParticleBurst trigger={burstSeq.n} x={burstSeq.x} y={burstSeq.y} color={burstSeq.color} count={burstSeq.count} />
      {session.activeNudge && <CoolOffNudge minutes={session.activeNudge} onDismiss={session.dismissNudge} />}
    </>
  );
};

// ── Pill ────────────────────────────────────────────────────────────────────
const Pill: React.FC<{ color: string; icon: string; label: string; sub: string; isMobile: boolean }> =
  ({ color, icon, label, sub, isMobile }) => (
  <div style={{
    display: 'flex', gap: 6, alignItems: 'center',
    background: `linear-gradient(135deg, ${color}22, ${color}0a)`,
    border: `1px solid ${color}55`, borderRadius: 999,
    padding: isMobile ? '4px 10px' : '6px 12px',
    fontFamily: "'Cinzel', serif",
  }}>
    <span style={{ color, fontSize: 14 }}>{icon}</span>
    <span style={{ color, fontSize: 9, letterSpacing: '0.15em', fontWeight: 700 }}>{label}</span>
    <span style={{ color: '#f0e6cf', fontSize: 11, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{sub}</span>
  </div>
);

// ── Session cool-off nudge (auto-shown at 30/60m) ──────────────────────────
const CoolOffNudge: React.FC<{ minutes: 30 | 60; onDismiss: () => void }> = ({ minutes, onDismiss }) => (
  <div style={{
    position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
    zIndex: 400, maxWidth: 420, width: 'calc(100% - 32px)',
    background: 'linear-gradient(135deg, rgba(80,20,120,0.9) 0%, rgba(40,10,70,0.95) 100%)',
    border: '1px solid rgba(192,124,230,0.5)',
    borderRadius: 14, padding: '14px 16px',
    display: 'flex', gap: 12, alignItems: 'center',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 32px rgba(192,124,230,0.25)',
    color: '#f0e6cf', backdropFilter: 'blur(6px)',
  }}>
    <div style={{ fontSize: 24, color: '#e0b0f0' }}>⌛</div>
    <div style={{ flex: 1, fontSize: 12, lineHeight: 1.4, fontFamily: "'Crimson Pro', serif" }}>
      You've been playing for <b style={{ color: '#f0c040' }}>{minutes} minutes</b>. Consider a short break —
      the felt will still be here.
    </div>
    <button onClick={onDismiss} style={{
      background: 'transparent', border: '1px solid rgba(192,124,230,0.5)',
      borderRadius: 8, color: '#e0b0f0',
      fontSize: 10, letterSpacing: '0.15em', fontFamily: "'Cinzel', serif", fontWeight: 700,
      padding: '6px 12px', cursor: 'pointer',
    }}>OK</button>
  </div>
);

export default App;
