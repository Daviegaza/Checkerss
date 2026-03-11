import { useCallback, useState } from 'react';
import {
  Board,
  CheckerPiece,
  GameState,
  HistoryEntry,
  Move,
  PieceColor,
  Position,
} from '../types/checkers.types';
import {
  applyMove,
  checkGameOver,
  cloneBoard,
  createInitialBoard,
  getLegalMoves,
  getLegalMovesFrom,
  moveToNotation,
  opponent,
} from '../utils/checkersEngine';

// ─── Initial State ────────────────────────────────────────────────────────────

function makeInitialState(): GameState {
  const board = createInitialBoard();
  const allLegalMoves = getLegalMoves(board, 'red');
  return {
    board,
    currentTurn: 'red',
    selectedSquare: null,
    legalMovesForSelected: [],
    allLegalMoves,
    isGameOver: false,
    winner: null,
    capturedByRed: [],
    capturedByBlack: [],
    moveHistory: [],
    halfMoveClock: 0,
  };
}

// ─── Hook Return ──────────────────────────────────────────────────────────────

export interface UseCheckersGameReturn {
  gameState: GameState;
  selectSquare: (pos: Position) => void;
  applyExternalMove: (move: Move) => void;
  resetGame: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCheckersGame(): UseCheckersGameReturn {
  const [gameState, setGameState] = useState<GameState>(makeInitialState);

  // ── Commit move to state ───────────────────────────────────────────────────
  const commitMove = useCallback((state: GameState, move: Move): GameState => {
    const captured: CheckerPiece[] = move.captures
      .map(pos => state.board[pos.row][pos.col])
      .filter((p): p is CheckerPiece => p !== null);

    const nextBoard = applyMove(state.board, move);
    const notation = moveToNotation(move);
    const entry: HistoryEntry = { move, notation };
    const moveHistory = [...state.moveHistory, entry];

    const capturedByRed = [...state.capturedByRed];
    const capturedByBlack = [...state.capturedByBlack];
    captured.forEach(p => {
      if (p.color === 'black') capturedByRed.push(p);
      else capturedByBlack.push(p);
    });

    const nextTurn: PieceColor = opponent(state.currentTurn);
    const { over, winner } = checkGameOver(nextBoard, nextTurn);

    const halfMoveClock = move.captures.length > 0 ? 0 : state.halfMoveClock + 1;
    const isDraw = halfMoveClock >= 80;

    const allLegalMoves = over || isDraw ? [] : getLegalMoves(nextBoard, nextTurn);

    return {
      ...state,
      board: nextBoard,
      currentTurn: nextTurn,
      selectedSquare: null,
      legalMovesForSelected: [],
      allLegalMoves,
      isGameOver: over || isDraw,
      winner: isDraw ? null : winner,
      capturedByRed,
      capturedByBlack,
      moveHistory,
      halfMoveClock,
    };
  }, []);

  // ── Player selects a square ────────────────────────────────────────────────
  const selectSquare = useCallback(
    (pos: Position) => {
      setGameState(prev => {
        if (prev.isGameOver || prev.currentTurn !== 'red') return prev;

        const clickedPiece = prev.board[pos.row][pos.col];

        // If a piece is already selected, check if clicked is a legal move destination
        if (prev.selectedSquare) {
          const matchingMove = prev.legalMovesForSelected.find(
            m => m.to.row === pos.row && m.to.col === pos.col
          );

          if (matchingMove) {
            return commitMove(prev, matchingMove);
          }

          // Clicked another red piece – reselect
          if (clickedPiece?.color === 'red') {
            const legal = getLegalMovesFrom(prev.board, pos, 'red');
            return { ...prev, selectedSquare: pos, legalMovesForSelected: legal };
          }

          // Deselect
          return { ...prev, selectedSquare: null, legalMovesForSelected: [] };
        }

        // No selection yet – select a red piece
        if (clickedPiece?.color === 'red') {
          const legal = getLegalMovesFrom(prev.board, pos, 'red');
          return { ...prev, selectedSquare: pos, legalMovesForSelected: legal };
        }

        return prev;
      });
    },
    [commitMove]
  );

  // ── AI applies a move ──────────────────────────────────────────────────────
  const applyExternalMove = useCallback(
    (move: Move) => {
      setGameState(prev => {
        if (prev.isGameOver) return prev;
        return commitMove(prev, move);
      });
    },
    [commitMove]
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    setGameState(makeInitialState());
  }, []);

  return { gameState, selectSquare, applyExternalMove, resetGame };
}
