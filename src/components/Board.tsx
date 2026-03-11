import React, { useMemo } from 'react';
import { GameState, Move, Position } from '../types/checkers.types';
import Square from './Square';

interface BoardProps {
  gameState: GameState;
  onSquareClick: (pos: Position) => void;
  isAITurn: boolean;
  squareSize?: number;
}

const Board: React.FC<BoardProps> = ({
  gameState,
  onSquareClick,
  isAITurn,
  squareSize = 72,
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

  return (
    <div
      style={{
        width: boardPx,
        height: boardPx,
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${squareSize}px)`,
        gridTemplateRows: `repeat(8, ${squareSize}px)`,
        border: '3px solid #8a5020',
        borderRadius: 4,
        boxShadow:
          '0 0 0 1px #4a2808, 0 24px 64px rgba(0,0,0,0.85), 0 4px 16px rgba(180,120,0,0.12)',
        overflow: 'hidden',
        cursor: isAITurn ? 'not-allowed' : 'default',
        opacity: isAITurn ? 0.93 : 1,
        transition: 'opacity 0.3s ease',
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
            />
          );
        })
      )}
    </div>
  );
};

export default Board;
