import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameState, Move, Position } from '../types/checkers.types';
import { ChipSkinId } from '../types/game.types';
import Square from './Square';

interface BoardProps {
  gameState: GameState;
  onSquareClick: (pos: Position) => void;
  isAITurn: boolean;
  squareSize?: number;
  skinId?: ChipSkinId;
}

const Board: React.FC<BoardProps> = ({
  gameState,
  onSquareClick,
  isAITurn,
  squareSize = 72,
  skinId = 'classic',
}) => {
  const { board, selectedSquare, legalMovesForSelected, moveHistory } = gameState;

  const legalDestSet = useMemo(() => {
    const s = new Set<string>();
    legalMovesForSelected.forEach(m => s.add(`${m.to.row},${m.to.col}`));
    return s;
  }, [legalMovesForSelected]);

  const captureDestSet = useMemo(() => {
    const s = new Set<string>();
    legalMovesForSelected
      .filter(m => m.captures.length > 0)
      .forEach(m => s.add(`${m.to.row},${m.to.col}`));
    return s;
  }, [legalMovesForSelected]);

  const lastMove: Move | null =
    moveHistory.length > 0 ? moveHistory[moveHistory.length - 1].move : null;

  const boardPx = squareSize * 8;

  const [shake, setShake] = useState(false);
  const prevMoveCountRef = useRef(moveHistory.length);
  useEffect(() => {
    if (moveHistory.length > prevMoveCountRef.current) {
      const last = moveHistory[moveHistory.length - 1]?.move;
      if (last && last.captures.length > 0) {
        setShake(true);
        const t = window.setTimeout(() => setShake(false), 450);
        return () => window.clearTimeout(t);
      }
    }
    prevMoveCountRef.current = moveHistory.length;
  }, [moveHistory]);

  return (
    <div
      className={`kf-board-3d kf-board-glow ${shake ? 'kf-shake' : ''}`}
      style={{
        width: boardPx,
        height: boardPx,
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${squareSize}px)`,
        gridTemplateRows: `repeat(8, ${squareSize}px)`,
        border: '4px solid #7a5a10',
        borderRadius: 6,
        boxShadow:
          '0 0 0 2px #3a2a08, 0 0 0 4px rgba(240,192,64,0.2), 0 24px 64px rgba(0,0,0,0.85), 0 4px 22px rgba(240,192,64,0.18)',
        overflow: 'hidden',
        cursor: isAITurn ? 'not-allowed' : 'default',
        opacity: isAITurn ? 0.93 : 1,
        transition: 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.2, 1.1, 0.4, 1)',
      }}
    >
      {board.map((rowArr, row) =>
        rowArr.map((piece, col) => {
          const isDark = (row + col) % 2 === 1;
          const key = `${row}-${col}`;
          const isSelected = !!(selectedSquare?.row === row && selectedSquare?.col === col);
          const isLegal = legalDestSet.has(`${row},${col}`);
          const isCapture = captureDestSet.has(`${row},${col}`);
          const isLastFrom = !!(lastMove?.from.row === row && lastMove?.from.col === col);
          const isLastTo = !!(lastMove?.to.row === row && lastMove?.to.col === col);

          return (
            <Square
              key={key}
              row={row}
              col={col}
              piece={piece}
              isDark={isDark}
              isSelected={isSelected}
              isLegalDest={isLegal}
              isLastMoveFrom={isLastFrom}
              isLastMoveTo={isLastTo}
              isCapture={isCapture}
              onClick={isAITurn ? () => {} : onSquareClick}
              size={squareSize}
              skinId={skinId}
            />
          );
        })
      )}
    </div>
  );
};

export default Board;
