import './App.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DifficultyLevel, GameResult, GameScreen, LEVEL_CONFIGS, LevelConfig } from './types/game.types';
import { useCheckersGame } from './hooks/useCheckersGame';
import { useAI } from './hooks/useAI';
import { usePoints } from './hooks/usePoints';
import { useWindowSize } from './hooks/useWindowSize';
import Board from './components/Board';
import GameStatus from './components/GameStatus';
import GameLobby from './components/GameLobby';
import GameResultScreen from './components/GameResultScreen';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('lobby');
  const [activeConfig, setActiveConfig] = useState<LevelConfig>(LEVEL_CONFIGS.easy);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const resultHandled = useRef(false);

  const { width, isMobile, isTablet } = useWindowSize();
  const { points, canAfford, placeBet, resolveBet, resetPoints } = usePoints();
  const { gameState, selectSquare, applyExternalMove, resetGame } = useCheckersGame();

  // ── Responsive square size ─────────────────────────────────────────────────
  const squareSize = (() => {
    if (isMobile) return Math.floor((Math.min(width, 480) - 16) / 8);
    if (isTablet) return Math.floor((Math.min(width * 0.92, 560) - 16) / 8);
    return Math.min(72, Math.floor((width - 340) / 8));
  })();
  const boardPx = squareSize * 8;

  // ── Start Game ─────────────────────────────────────────────────────────────
  const handleStartGame = useCallback((level: DifficultyLevel) => {
    const cfg = LEVEL_CONFIGS[level];
    if (!canAfford(cfg.cost)) return;
    if (!placeBet(cfg.cost)) return;
    setActiveConfig(cfg);
    resultHandled.current = false;
    setGameResult(null);
    resetGame();
    setScreen('playing');
  }, [canAfford, placeBet, resetGame]);

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

  // ── Detect Game Over ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameState.isGameOver || screen !== 'playing' || resultHandled.current) return;
    resultHandled.current = true;

    let type: GameResult['type'];
    let reason: string;

    if (gameState.winner === 'red') {
      type = 'player_win';
      reason = 'All black pieces captured — the board is yours!';
    } else if (gameState.winner === 'black') {
      type = 'computer_win';
      reason = 'The AI cleared the board — a crushing defeat.';
    } else {
      type = 'draw';
      reason = '80 moves without a capture — the game is drawn.';
    }

    const delta = resolveBet(type, activeConfig);
    setGameResult({ type, reason, pointsChange: delta });
    setTimeout(() => setScreen('result'), 1800);
  }, [gameState.isGameOver, gameState.winner, screen, resolveBet, activeConfig]);

  // ── Resign ─────────────────────────────────────────────────────────────────
  const handleResign = useCallback(() => {
    if (resultHandled.current) return;
    resultHandled.current = true;
    const delta = resolveBet('computer_win', activeConfig);
    setGameResult({ type: 'computer_win', reason: 'You resigned — the kingdom falls.', pointsChange: delta });
    setScreen('result');
  }, [resolveBet, activeConfig]);

  // ── Play Again ─────────────────────────────────────────────────────────────
  const handlePlayAgain = useCallback(() => {
    if (!canAfford(activeConfig.cost) || !placeBet(activeConfig.cost)) { setScreen('lobby'); return; }
    resultHandled.current = false;
    setGameResult(null);
    resetGame();
    setScreen('playing');
  }, [activeConfig, canAfford, placeBet, resetGame]);

  // ── Screens ────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    return <GameLobby points={points} onStartGame={handleStartGame} onResetPoints={resetPoints} />;
  }

  if (screen === 'result' && gameResult) {
    return (
      <GameResultScreen
        result={gameResult} config={activeConfig} points={points}
        onPlayAgain={handlePlayAgain} onBackToLobby={() => setScreen('lobby')}
      />
    );
  }

  // ── Playing Screen ─────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 25%, #1a0800 0%, #0d0906 55%, #050403 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: isMobile ? '10px 8px 20px' : '18px 16px 32px',
      gap: isMobile ? 10 : 16,
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: isMobile ? '100%' : boardPx + 260,
      }}>
        <h2 style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 900,
          margin: 0,
          letterSpacing: '0.1em',
          background: 'linear-gradient(180deg, #ff7733 0%, #e04010 60%, #901808 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          CHECKERS
        </h2>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: isMobile ? '5px 10px' : '6px 16px',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span style={{ color: '#6a3818',  fontSize: 9, letterSpacing: '0.1em' }}>BALANCE</span>
          <span style={{
            color: points.balance <= 8 ? '#f87171' : '#e05020',
            fontSize: isMobile ? 15 : 18, fontWeight: 700,
          }}>
            {points.balance} pts
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile || isTablet ? 'column' : 'row',
        alignItems: isMobile || isTablet ? 'center' : 'flex-start',
        gap: isMobile ? 10 : 20,
        width: '100%',
        maxWidth: isMobile ? '100%' : boardPx + 280,
      }}>

        {/* Board column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* AI label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6,
          }}>
            <div style={{
              width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
              background: isAIThinking ? '#7dd3fc' : '#3a3a4a',
              boxShadow: isAIThinking ? '0 0 8px #7dd3fc' : 'none',
              transition: 'all 0.3s ease',
            }} />
            <span style={{ color: '#5a5060', fontSize: 10, letterSpacing: '0.08em' }}>
              {isAIThinking ? 'AI is thinking…' : `AI · ${activeConfig.label} · Black`}
            </span>
          </div>

          <Board
            gameState={gameState}
            onSquareClick={selectSquare}
            isAITurn={gameState.currentTurn === 'black' || isAIThinking}
            squareSize={squareSize}
          />

          {/* Player label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6,
          }}>
            <div style={{
              width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
              background: gameState.currentTurn === 'red' ? '#e05020' : '#3a3a4a',
              boxShadow: gameState.currentTurn === 'red' ? '0 0 8px #e05020' : 'none',
              transition: 'all 0.3s ease',
            }} />
            <span style={{ color: '#8a5a38', fontSize: 10, letterSpacing: '0.08em' }}>
              You · Red
            </span>
          </div>
        </div>

        {/* Status panel */}
        <GameStatus
          gameState={gameState}
          config={activeConfig}
          isAIThinking={isAIThinking}
          onResign={handleResign}
          isMobile={isMobile || isTablet}
          boardWidth={boardPx}
        />
      </div>
    </div>
  );
};

export default App;
