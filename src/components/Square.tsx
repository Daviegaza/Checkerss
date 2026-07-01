import React from 'react';
import { CheckerPiece, Position } from '../types/checkers.types';
import { ChipSkinId, CHIP_SKINS } from '../types/game.types';
import CheckerPieceCanvas from './CheckerPiece';

interface SquareProps {
  row: number;
  col: number;
  piece: CheckerPiece | null;
  isDark: boolean;
  isSelected: boolean;
  isLegalDest: boolean;
  isLastMoveFrom: boolean;
  isLastMoveTo: boolean;
  isCapture: boolean;
  onClick: (pos: Position) => void;
  size: number;
  skinId?: ChipSkinId;
}

const Square: React.FC<SquareProps> = ({
  row, col, piece, isDark, isSelected, isLegalDest,
  isLastMoveFrom, isLastMoveTo, isCapture,
  onClick, size, skinId = 'classic',
}) => {
  const handleClick = () => {
    if (isDark) onClick({ row, col });
  };

  const skin = CHIP_SKINS[skinId] || CHIP_SKINS.classic;

  // Board colors from active skin
  let bg = isDark ? skin.boardDark : skin.boardLight;

  if (isDark) {
    if (isSelected)      bg = '#d4a017';
    else if (isLastMoveTo)   bg = '#4a7a28';
    else if (isLastMoveFrom) bg = '#356a34';
    else if (isCapture)      bg = '#a02040';
  }

  return (
    <div
      onClick={handleClick}
      style={{
        width: size,
        height: size,
        background: bg,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDark ? 'pointer' : 'default',
        boxSizing: 'border-box',
        transition: 'background 0.12s ease',
      }}
    >
      {/* Legal move dot */}
      {isLegalDest && isDark && !piece && (
        <div style={{
          position: 'absolute',
          width: size * 0.30,
          height: size * 0.30,
          borderRadius: '50%',
          background: 'rgba(255,220,80,0.55)',
          border: '2px solid rgba(255,200,50,0.8)',
          pointerEvents: 'none',
          zIndex: 2,
          boxShadow: '0 0 8px rgba(255,200,50,0.4)',
        }} />
      )}

      {/* Legal capture ring (over enemy piece) */}
      {isLegalDest && isDark && piece && (
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          border: '3px solid rgba(255,220,50,0.85)',
          pointerEvents: 'none',
          zIndex: 4,
          boxShadow: '0 0 10px rgba(255,200,50,0.5)',
        }} />
      )}

      {/* Piece */}
      {piece && (
        <div style={{
          position: 'relative',
          zIndex: 3,
          transform: isSelected ? 'scale(1.12) translateY(-4px)' : 'scale(1)',
          transition: 'transform 0.12s ease',
          filter: isSelected ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.7))' : 'none',
        }}>
          <CheckerPieceCanvas piece={piece} size={size * 0.88} skinId={skinId} />
        </div>
      )}

      {/* Coordinate labels */}
      {col === 0 && isDark && (
        <span style={{
          position: 'absolute', top: 2, left: 3,
          fontSize: Math.max(9, size * 0.14),
          fontWeight: 700,
          color: 'rgba(240,192,64,0.55)',
          lineHeight: 1,
          
          pointerEvents: 'none',
          zIndex: 5,
        }}>
          {8 - row}
        </span>
      )}
      {row === 7 && isDark && (
        <span style={{
          position: 'absolute', bottom: 2, right: 3,
          fontSize: Math.max(9, size * 0.14),
          fontWeight: 700,
          color: 'rgba(240,192,64,0.55)',
          lineHeight: 1,
          
          pointerEvents: 'none',
          zIndex: 5,
        }}>
          {String.fromCharCode(97 + col)}
        </span>
      )}
    </div>
  );
};

export default Square;
