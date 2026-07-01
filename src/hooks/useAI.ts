import { useCallback, useEffect, useRef } from 'react';
import { Move, PieceColor } from '../types/checkers.types';
import { DifficultyLevel } from '../types/game.types';
import { GameState } from '../types/checkers.types';
import { getAIMove } from '../utils/aiEngine';

interface UseAIOptions {
  gameState: GameState;
  aiColor: PieceColor;
  difficulty: DifficultyLevel;
  enabled: boolean;
  onMoveMade: (move: Move) => void;
  onThinkingChange: (thinking: boolean) => void;
}

const AI_DELAY: Record<DifficultyLevel, [number, number]> = {
  easy:       [300,  700],
  medium:     [500, 1000],
  hard:       [700, 1500],
  expert:     [900, 2000],
  highroller: [1100, 2400],
};

export function useAI({
  gameState,
  aiColor,
  difficulty,
  enabled,
  onMoveMade,
  onThinkingChange,
}: UseAIOptions): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(() => {
    if (
      !enabled ||
      gameState.currentTurn !== aiColor ||
      gameState.isGameOver
    ) return;

    onThinkingChange(true);
    const [min, max] = AI_DELAY[difficulty];
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;

    timeoutRef.current = setTimeout(() => {
      const move = getAIMove(gameState.board, aiColor, difficulty);
      onThinkingChange(false);
      if (move) onMoveMade(move);
    }, delay);
  }, [
    enabled,
    gameState.board,
    gameState.currentTurn,
    gameState.isGameOver,
    aiColor,
    difficulty,
    onMoveMade,
    onThinkingChange,
  ]);

  useEffect(() => {
    run();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [run]);
}
