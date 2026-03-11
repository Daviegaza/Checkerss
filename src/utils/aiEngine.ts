import { Board, Move, PieceColor } from '../types/checkers.types';
import { applyMove, getLegalMoves, opponent } from './checkersEngine';

// ─── Piece-Square Tables ──────────────────────────────────────────────────────

// For red pieces (goal: reach row 0)
const RED_PST: number[][] = [
  [ 0,  0,  0,  0,  0,  0,  0,  0], // row 0 – king row
  [ 8, 10,  8, 10,  8, 10,  8, 10],
  [ 6,  8,  8, 10,  8,  8,  6,  8],
  [ 4,  6,  8,  8,  8,  6,  4,  6],
  [ 2,  4,  6,  8,  6,  4,  2,  4],
  [ 0,  2,  4,  6,  4,  2,  0,  2],
  [-2,  0,  2,  4,  2,  0, -2,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0], // starting row
];

// For black pieces (goal: reach row 7)
const BLACK_PST: number[][] = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [-2,  0,  2,  4,  2,  0, -2,  0],
  [ 0,  2,  4,  6,  4,  2,  0,  2],
  [ 2,  4,  6,  8,  6,  4,  2,  4],
  [ 4,  6,  8,  8,  8,  6,  4,  6],
  [ 6,  8,  8, 10,  8,  8,  6,  8],
  [ 8, 10,  8, 10,  8, 10,  8, 10],
  [ 0,  0,  0,  0,  0,  0,  0,  0], // king row
];

// ─── Board Evaluation ─────────────────────────────────────────────────────────

function evaluate(board: Board, color: PieceColor): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;

      const material = p.isKing ? 300 : 100;
      const positional = p.color === 'red'
        ? RED_PST[r][c]
        : BLACK_PST[r][c];

      // Back-row defense bonus
      const backRow = p.color === 'red'
        ? (r === 7 ? 15 : 0)
        : (r === 0 ? 15 : 0);

      const pieceScore = material + positional + backRow;
      score += p.color === color ? pieceScore : -pieceScore;
    }
  }

  return score;
}

// ─── Minimax with Alpha-Beta ──────────────────────────────────────────────────

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  currentColor: PieceColor,
  maxColor: PieceColor
): number {
  const moves = getLegalMoves(board, currentColor);

  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      return isMaximizing ? -100000 + depth : 100000 - depth;
    }
    return evaluate(board, maxColor);
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of moves) {
      const next = applyMove(board, move);
      const score = minimax(next, depth - 1, alpha, beta, false, opponent(currentColor), maxColor);
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const next = applyMove(board, move);
      const score = minimax(next, depth - 1, alpha, beta, true, opponent(currentColor), maxColor);
      best = Math.min(best, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// ─── AI Move Selection ────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DEPTH_MAP: Record<string, number> = {
  easy: 0,
  medium: 2,
  hard: 4,
  expert: 6,
};

export function getAIMove(
  board: Board,
  color: PieceColor,
  level: string
): Move | null {
  const moves = getLegalMoves(board, color);
  if (moves.length === 0) return null;

  if (level === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = DEPTH_MAP[level] ?? 2;
  const shuffled = shuffle(moves);

  let bestMove = shuffled[0];
  let bestScore = -Infinity;

  for (const move of shuffled) {
    const next = applyMove(board, move);
    const score = minimax(next, depth - 1, -Infinity, Infinity, false, opponent(color), color);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
