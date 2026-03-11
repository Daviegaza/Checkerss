// ─── Piece ────────────────────────────────────────────────────────────────────

export type PieceColor = 'red' | 'black';

export interface CheckerPiece {
  color: PieceColor;
  isKing: boolean;
}

// ─── Board ────────────────────────────────────────────────────────────────────

export type Square = CheckerPiece | null;
export type Board = Square[][];

// ─── Position & Move ─────────────────────────────────────────────────────────

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[]; // all captured positions (supports multi-jump chains)
}

// ─── Game State ───────────────────────────────────────────────────────────────

export interface GameState {
  board: Board;
  currentTurn: PieceColor;
  selectedSquare: Position | null;
  legalMovesForSelected: Move[];
  allLegalMoves: Move[];
  isGameOver: boolean;
  winner: PieceColor | null;
  capturedByRed: CheckerPiece[];
  capturedByBlack: CheckerPiece[];
  moveHistory: HistoryEntry[];
  halfMoveClock: number;
}

export interface HistoryEntry {
  move: Move;
  notation: string;
}
