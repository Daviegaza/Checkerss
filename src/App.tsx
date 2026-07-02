import './App.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChipSkinId, CHIP_SKINS,
  DifficultyLevel, GameResult, GameScreen,
  JACKPOT_TIERS,
  LEVEL_CONFIGS, LevelConfig,
  makeInitialSideBetState, RoundMetricDelta,
  SideBetId, SideBetState,
  vipTierFor,
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
import LobbyBody from './components/LobbyBody';
import GameResultScreen from './components/GameResultScreen';
import ParticleBurst from './components/ParticleBurst';
import AgeGate from './components/AgeGate';
import PlayingScreen from './components/PlayingScreen';
import CasinoChrome from './components/CasinoChrome';
import {
  ModalKey, MissionsModal, VipModal, LeaderboardModal, StoreModal,
  PromotionsModal, CashierModal, TablesModal, AchievementsModal,
} from './components/LobbyModals';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('lobby');
  const [activeConfig, setActiveConfig] = useState<LevelConfig>(LEVEL_CONFIGS.easy);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [showTabQuitConfirm, setShowTabQuitConfirm] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [sideBetState, setSideBetState] = useState<SideBetState>(makeInitialSideBetState);
  const [burstSeq, setBurstSeq] = useState<{ n: number; x: number; y: number; color: string; count: number }>({
    n: -1, x: 0, y: 0, color: '#f0c040', count: 30,
  });
  const [toasts, setToasts] = useState<{ id: number; icon: string; label: string; color: string }[]>([]);
  const toastCounter = useRef(0);
  const showToast = useCallback((icon: string, label: string, color = '#f0c040') => {
    toastCounter.current += 1;
    const id = toastCounter.current;
    setToasts(cur => [...cur.slice(-2), { id, icon, label, color }]);
    setTimeout(() => setToasts(cur => cur.filter(t => t.id !== id)), 2600);
  }, []);
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
  // Mobile overhead: outer padding 12 + panel padding+border 14 + rail 14 + rail-gap 6 + safety 4 ≈ 50px.
  const squareSize = (() => {
    if (isMobile) return Math.max(32, Math.min(56, Math.floor((width - 50) / 8)));
    if (isTablet) return Math.floor((Math.min(width * 0.9, 620) - 80) / 8);
    return Math.min(68, Math.floor((width - 640) / 8));
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
      showToast('★', `${JACKPOT_TIERS[tid].label} JACKPOT +${outcome.jackpotAmount}`, JACKPOT_TIERS[tid].color);
    } else if (type === 'player_win') {
      play('win');
      fireBurst(activeSkin.playerColor, 55);
    } else if (type === 'draw') {
      play('draw');
    } else {
      play('lose');
    }
    if (outcome.newAchievements.length > 0) {
      const a = outcome.newAchievements[0];
      setTimeout(() => showToast(a.icon, `${a.label.toUpperCase()} +${a.reward}`, '#f0c040'), 400);
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
      showToast('🎁', `DAILY BONUS +${gained}`, '#f0c040');
    }
  }, [claimDailyBonus, play, fireBurst, showToast]);

  const handleClaimMission = useCallback((templateId: string) => {
    const reward = missions.claim(templateId);
    if (reward > 0) {
      addChips(reward);
      play('missionComplete');
      fireBurst('#c07ce6', 35);
      showToast('✦', `MISSION +${reward}`, '#c07ce6');
    }
  }, [missions, addChips, play, fireBurst, showToast]);

  const handleGoToLobby = useCallback(() => {
    play('chipClick');
    setScreen('lobby');
  }, [play]);

  // ── Age gate blocks all screens until acknowledged ─────────────────────────
  if (!points.ageAcknowledged) {
    return <AgeGate onAcknowledge={acknowledgeAge} />;
  }

  const missionsPendingCount = missions.state.missions.filter(
    m => !m.claimed && m.progress < m.target
  ).length;

  const openModal = useCallback((k: ModalKey) => {
    play('chipClick');
    setActiveModal(k);
  }, [play]);

  const handleQuickPlay = useCallback(() => {
    const quickLevel: DifficultyLevel = tier.tier >= 1 ? 'medium' : 'easy';
    beginRound(LEVEL_CONFIGS[quickLevel], []);
  }, [beginRound, tier.tier]);

  const chromeProps = {
    points, muted, isMobile,
    onToggleMute: toggleMute,
    onCashier: () => { play('coin'); setActiveModal('cashier'); },
    tier, dailyBonus,
    missionsCount: missionsPendingCount,
    onClaimDaily: handleClaimDaily,
    onNav: (k: 'play' | 'missions' | 'vip' | 'leaderboard' | 'store' | 'promotions') => {
      if (k === 'play') {
        setActiveModal(null);
        if (screen === 'playing' && !gameState.isGameOver) {
          setShowTabQuitConfirm(true);
        } else {
          setScreen('lobby');
        }
        return;
      }
      setActiveModal(k);
    },
    onQuickPlay: handleQuickPlay,
    onOpenPromotions: () => setActiveModal('promotions'),
    onSfx: (n: 'chipClick' | 'coin' | 'error' | 'hover') => play(n),
    activeNav: (screen === 'playing' ? 'play' : 'play') as 'play',
  };

  const tabQuitConfirmOverlay = showTabQuitConfirm ? (
    <div
      onClick={() => setShowTabQuitConfirm(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 450,
        background: 'rgba(10,15,12,0.62)',
        backdropFilter: 'blur(12px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(420px, 100%)', padding: 24, borderRadius: 18,
          background:
            'radial-gradient(ellipse at 0% 0%, rgba(255,90,108,0.16) 0%, transparent 60%),' +
            'linear-gradient(180deg, rgba(38,46,40,0.98), rgba(22,30,26,0.98))',
          border: '1px solid rgba(255,90,108,0.5)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(255,90,108,0.18)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 36, color: '#ff5a6c', marginBottom: 6 }}>⚑</div>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: '0.28em',
          color: '#ff5a6c', fontWeight: 900,
        }}>QUIT ROUND?</div>
        <div style={{
          fontFamily: "'Crimson Pro', serif", fontSize: 14, color: '#f5ecd6',
          marginTop: 10, lineHeight: 1.5,
        }}>
          You'll forfeit this hand and lose your buy-in. The felt will be waiting when you return.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
          <button
            onClick={() => { play('chipClick'); setShowTabQuitConfirm(false); }}
            className="kf-tap"
            style={{
              padding: 14, borderRadius: 12, cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(248,206,85,0.5)',
              color: '#f8ce55',
              fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.24em', fontWeight: 800,
              minHeight: 52,
            }}
          >NO · KEEP PLAYING</button>
          <button
            onClick={() => { setShowTabQuitConfirm(false); setScreen('lobby'); }}
            className="kf-tap"
            style={{
              padding: 14, borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(180deg, #ff5a6c, #a02030)',
              border: '1px solid #ff5a6c',
              color: '#fff',
              fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.24em', fontWeight: 900,
              minHeight: 52, boxShadow: '0 8px 22px rgba(255,90,108,0.4)',
            }}
          >YES · QUIT</button>
        </div>
      </div>
    </div>
  ) : null;

  const modalOverlay = (
    <>
      {activeModal === 'missions' && (
        <MissionsModal
          missions={missions.state}
          onClaim={handleClaimMission}
          onReroll={() => { play('chipClick'); missions.reroll(); }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'vip' && (
        <VipModal tier={tier} points={points} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'leaderboard' && (
        <LeaderboardModal points={points} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'store' && (
        <StoreModal
          points={points} tier={tier}
          onEquip={(id) => { play('skinUnlock'); equipSkin(id); showToast('◆', `EQUIPPED ${id.toUpperCase()}`, '#c07ce6'); }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'promotions' && (
        <PromotionsModal
          dailyBonus={dailyBonus}
          onClaimDaily={() => { handleClaimDaily(); setActiveModal(null); }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'cashier' && (
        <CashierModal
          points={points}
          onAddChips={(n) => {
            addChips(n);
            fireBurst('#f0c040', 40);
            showToast('⛃', `+${n.toLocaleString()} CHIPS`, '#f0c040');
          }}
          onReset={() => { resetPoints(); showToast('↻', 'PROGRESS RESET', '#f04d5c'); }}
          onClose={() => setActiveModal(null)}
          onSfx={(n) => play(n)}
        />
      )}
      {activeModal === 'tables' && (
        <TablesModal
          points={points} tier={tier}
          onPlay={(level) => { setActiveModal(null); handleStartGame(level, []); }}
          onSfx={(n) => play(n)}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'achievements' && (
        <AchievementsModal points={points} onClose={() => setActiveModal(null)} />
      )}
    </>
  );

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    return (
      <>
        <CasinoChrome {...chromeProps}>
          <LobbyBody
            points={points}
            tier={tier}
            dailyBonus={dailyBonus}
            missions={missions.state}
            onClaimDaily={handleClaimDaily}
            onClaimMission={handleClaimMission}
            onStartGame={handleStartGame}
            onSfx={lobbySfx}
            isMobile={isMobile}
            onBrowseTables={() => setActiveModal('tables')}
            onOpenAchievements={() => setActiveModal('achievements')}
          />
        </CasinoChrome>
        {modalOverlay}
        {tabQuitConfirmOverlay}
        <ParticleBurst trigger={burstSeq.n} x={burstSeq.x} y={burstSeq.y} color={burstSeq.color} count={burstSeq.count} />
        {toasts.length > 0 && (
          <div className="kf-toast-stack">
            {toasts.map(t => (
              <div key={t.id} className="kf-toast" style={{ borderColor: `${t.color}88` }}>
                <span style={{ color: t.color, fontSize: 18 }}>{t.icon}</span>
                <span style={{ color: '#f0e6cf' }}>{t.label}</span>
              </div>
            ))}
          </div>
        )}
        {session.activeNudge && (
          <CoolOffNudge minutes={session.activeNudge} onDismiss={session.dismissNudge} />
        )}
      </>
    );
  }

  if (screen === 'result' && gameResult) {
    return (
      <>
        <CasinoChrome {...chromeProps}>
          <GameResultScreen
            result={gameResult} config={activeConfig} points={points}
            onPlayAgain={handlePlayAgain}
            onBackToLobby={() => setScreen('lobby')}
            onSfx={resultSfx}
          />
        </CasinoChrome>
        {modalOverlay}
        {tabQuitConfirmOverlay}
        <ParticleBurst trigger={burstSeq.n} x={burstSeq.x} y={burstSeq.y} color={burstSeq.color} count={burstSeq.count} />
        {toasts.length > 0 && (
          <div className="kf-toast-stack">
            {toasts.map(t => (
              <div key={t.id} className="kf-toast" style={{ borderColor: `${t.color}88` }}>
                <span style={{ color: t.color, fontSize: 18 }}>{t.icon}</span>
                <span style={{ color: '#f0e6cf' }}>{t.label}</span>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // ── Playing Screen ─────────────────────────────────────────────────────────
  return (
    <>
      <CasinoChrome {...chromeProps}>
      <PlayingScreen
        gameState={gameState}
        config={activeConfig}
        isAIThinking={isAIThinking}
        isMobile={isMobile}
        isTablet={isTablet}
        squareSize={squareSize}
        boardPx={boardPx}
        points={points}
        tier={tier}
        activeSkin={activeSkin}
        activeSkinId={points.activeSkin}
        unlockedSkins={points.unlockedSkins}
        muted={muted}
        ambientOn={ambientOn}
        dailyBonus={dailyBonus}
        missionsCount={missionsPendingCount}
        sessionLabel={session.elapsedLabel}
        sideBetState={sideBetState}
        onSelectSquare={selectSquare}
        onResign={handleResign}
        onToggleMute={() => { play('chipClick'); toggleMute(); }}
        onToggleAmbient={() => { play('chipClick'); toggleAmbient(); }}
        onGoToLobby={handleGoToLobby}
        onEquipSkin={(id) => { play('skinUnlock'); equipSkin(id); }}
        onClaimDaily={handleClaimDaily}
        onSfx={(n) => play(n)}
      />
      </CasinoChrome>
      {modalOverlay}
      {tabQuitConfirmOverlay}
      <ParticleBurst trigger={burstSeq.n} x={burstSeq.x} y={burstSeq.y} color={burstSeq.color} count={burstSeq.count} />
      {toasts.length > 0 && (
        <div className="kf-toast-stack">
          {toasts.map(t => (
            <div key={t.id} className="kf-toast" style={{ borderColor: `${t.color}88` }}>
              <span style={{ color: t.color, fontSize: 18 }}>{t.icon}</span>
              <span style={{ color: '#f0e6cf' }}>{t.label}</span>
            </div>
          ))}
        </div>
      )}
      {session.activeNudge && <CoolOffNudge minutes={session.activeNudge} onDismiss={session.dismissNudge} />}
    </>
  );
};

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
