import { Board, CheckerPiece, Move, PieceColor, Position, Square } from '../types/checkers.types';

// ─── Board Setup ──────────────────────────────────────────────────────────────

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Black pieces: rows 0-2, dark squares (row+col) % 2 === 1
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', isKing: false };
      }
    }
  }

  // Red pieces: rows 5-7, dark squares
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', isKing: false };
      }
    }
  }

  return board;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(sq => (sq ? { ...sq } : null)));
}

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function opponent(color: PieceColor): PieceColor {
  return color === 'red' ? 'black' : 'red';
}

export function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

// ─── Jump Generation (recursive multi-jump) ───────────────────────────────────

function generateJumps(
  board: Board,
  startPos: Position,
  currentPos: Position,
  capturedSoFar: Position[],
  isKing: boolean,
  color: PieceColor
): Move[] {
  const forwardDir = color === 'red' ? -1 : 1;
  const rowDirs = isKing ? [-1, 1] : [forwardDir];
  const results: Move[] = [];

  for (const dr of rowDirs) {
    for (const dc of [-1, 1]) {
      const midRow = currentPos.row + dr;
      const midCol = currentPos.col + dc;
      const landRow = currentPos.row + dr * 2;
      const landCol = currentPos.col + dc * 2;

      if (!inBounds(landRow, landCol)) continue;
      const midPiece = board[midRow][midCol];
      if (!midPiece || midPiece.color === color) continue;
      // Don't recapture in this chain
      if (capturedSoFar.some(c => c.row === midRow && c.col === midCol)) continue;
      if (board[landRow][landCol] !== null) continue;

      const newCaptures = [...capturedSoFar, { row: midRow, col: midCol }];

      // Check promotion at landing
      const becomesKing =
        !isKing &&
        ((color === 'red' && landRow === 0) || (color === 'black' && landRow === 7));

      // Simulate board for continuation search
      const nextBoard = cloneBoard(board);
      nextBoard[landRow][landCol] = { color, isKing: isKing || becomesKing };
      nextBoard[currentPos.row][currentPos.col] = null;
      nextBoard[midRow][midCol] = null;

      if (becomesKing) {
        // Standard rules: stop after promotion
        results.push({ from: startPos, to: { row: landRow, col: landCol }, captures: newCaptures });
        continue;
      }

      const continuations = generateJumps(
        nextBoard, startPos, { row: landRow, col: landCol },
        newCaptures, isKing, color
      );

      if (continuations.length > 0) {
        results.push(...continuations);
      } else {
        results.push({ from: startPos, to: { row: landRow, col: landCol }, captures: newCaptures });
      }
    }
  }

  return results;
}

function getJumpsFrom(board: Board, pos: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];
  return generateJumps(board, pos, pos, [], piece.isKing, piece.color);
}

// ─── Simple Move Generation ───────────────────────────────────────────────────

function getSimpleMovesFrom(board: Board, pos: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const forwardDir = piece.color === 'red' ? -1 : 1;
  const rowDirs = piece.isKing ? [-1, 1] : [forwardDir];
  const moves: Move[] = [];

  for (const dr of rowDirs) {
    for (const dc of [-1, 1]) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (inBounds(r, c) && !board[r][c]) {
        moves.push({ from: pos, to: { row: r, col: c }, captures: [] });
      }
    }
  }

  return moves;
}

// ─── All Legal Moves (mandatory jump rule enforced) ───────────────────────────

export function getLegalMoves(board: Board, color: PieceColor): Move[] {
  const jumps: Move[] = [];
  const simples: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) continue;
      const pos = { row, col };
      jumps.push(...getJumpsFrom(board, pos));
      simples.push(...getSimpleMovesFrom(board, pos));
    }
  }

  // Mandatory jump rule: if any jump exists, must jump
  return jumps.length > 0 ? jumps : simples;
}

export function getLegalMovesFrom(board: Board, pos: Position, color: PieceColor): Move[] {
  const all = getLegalMoves(board, color);
  return all.filter(m => m.from.row === pos.row && m.from.col === pos.col);
}

// ─── Apply Move ───────────────────────────────────────────────────────────────

export function applyMove(board: Board, move: Move): Board {
  const next = cloneBoard(board);
  const piece = next[move.from.row][move.from.col]!;

  next[move.from.row][move.from.col] = null;

  // Remove captured pieces
  move.captures.forEach(cap => {
    next[cap.row][cap.col] = null;
  });

  // Promote to king if reaching back rank
  const isKing =
    piece.isKing ||
    (piece.color === 'red' && move.to.row === 0) ||
    (piece.color === 'black' && move.to.row === 7);

  next[move.to.row][move.to.col] = { ...piece, isKing };
  return next;
}

// ─── Game-Over Check ──────────────────────────────────────────────────────────

export function checkGameOver(
  board: Board,
  nextTurn: PieceColor
): { over: boolean; winner: PieceColor | null } {
  let redCount = 0;
  let blackCount = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p?.color === 'red') redCount++;
      else if (p?.color === 'black') blackCount++;
    }
  }

  if (redCount === 0) return { over: true, winner: 'black' };
  if (blackCount === 0) return { over: true, winner: 'red' };

  const moves = getLegalMoves(board, nextTurn);
  if (moves.length === 0) return { over: true, winner: opponent(nextTurn) };

  return { over: false, winner: null };
}

// ─── Piece Counts ─────────────────────────────────────────────────────────────

export function getPieceCounts(board: Board): {
  red: number; redKings: number;
  black: number; blackKings: number;
} {
  let red = 0, redKings = 0, black = 0, blackKings = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      if (p.color === 'red') { red++; if (p.isKing) redKings++; }
      else { black++; if (p.isKing) blackKings++; }
    }
  }
  return { red, redKings, black, blackKings };
}

// ─── Notation ─────────────────────────────────────────────────────────────────

const FILE = ['a','b','c','d','e','f','g','h'];
const RANK = ['8','7','6','5','4','3','2','1'];

export function toAlgebraic(pos: Position): string {
  return `${FILE[pos.col]}${RANK[pos.row]}`;
}

export function moveToNotation(move: Move): string {
  const sep = move.captures.length > 0 ? 'x' : '-';
  return `${toAlgebraic(move.from)}${sep}${toAlgebraic(move.to)}`;
}
