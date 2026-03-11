import React from 'react';
import { GameState } from '../types/checkers.types';
import { LevelConfig } from '../types/game.types';
import { getPieceCounts } from '../utils/checkersEngine';

interface GameStatusProps {
  gameState: GameState;
  config: LevelConfig;
  isAIThinking: boolean;
  onResign: () => void;
  isMobile?: boolean;
  boardWidth?: number;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameState, config, isAIThinking, onResign, isMobile = false, boardWidth = 576,
}) => {
  const { currentTurn, isGameOver, winner, capturedByRed, capturedByBlack, moveHistory, board } = gameState;
  const counts = getPieceCounts(board);

  const statusText = (() => {
    if (isGameOver) return winner === 'red' ? '★ You Win!' : winner === 'black' ? '★ AI Wins' : '— Draw —';
    if (isAIThinking) return '⟳ AI thinking…';
    return currentTurn === 'red' ? 'Your move (Red)' : "AI's move (Black)";
  })();

  const statusColor = (() => {
    if (isGameOver) return winner === 'red' ? '#4ade80' : winner === 'black' ? '#f87171' : '#facc15';
    if (isAIThinking) return '#7dd3fc';
    return currentTurn === 'red' ? '#f87171' : '#9ca3af';
  })();

  const movePairs: { num: number; red?: string; black?: string }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      red: moveHistory[i]?.notation,
      black: moveHistory[i + 1]?.notation,
    });
  }

  // ── Piece count display ──────────────────────────────────────────────────
  const PieceCountRow = () => (
    <div style={{ display: 'flex', gap: isMobile ? 20 : 16, justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f87171', fontSize: isMobile ? 22 : 20, fontWeight: 700 }}>
          {counts.red}
        </div>
        <div style={{ color: '#6a4030', fontSize: 9, letterSpacing: '0.1em' }}>
          RED {counts.redKings > 0 ? `(${counts.redKings}♛)` : ''}
        </div>
      </div>
      <div style={{ color: '#5a3a20', fontSize: 18, alignSelf: 'center' }}>vs</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#9ca3af', fontSize: isMobile ? 22 : 20, fontWeight: 700 }}>
          {counts.black}
        </div>
        <div style={{ color: '#6a4030', fontSize: 9, letterSpacing: '0.1em' }}>
          BLACK {counts.blackKings > 0 ? `(${counts.blackKings}♛)` : ''}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ width: boardWidth || '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Status + Level */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ color: statusColor, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
              {statusText}
            </div>
          </div>
          <div style={{
            background: config.gradient,
            border: `1px solid ${config.color}40`,
            borderRadius: 8, padding: '10px 14px', textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{ color: config.color, fontSize: 10, letterSpacing: '0.15em', fontWeight: 700 }}>
              {config.label}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 2 }}>
              {config.cost}↓ / +{config.reward}↑
            </div>
          </div>
        </div>

        {/* Piece counts */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, padding: '10px 12px',
        }}>
          <PieceCountRow />
        </div>

        {/* Captures */}
        {(capturedByRed.length > 0 || capturedByBlack.length > 0) && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '8px 12px',
            display: 'flex', gap: 16,
          }}>
            <div>
              <div style={{ color: '#6a4030', fontSize: 9, letterSpacing: '0.1em', marginBottom: 4 }}>YOU TOOK</div>
              <div style={{ color: '#f87171', fontSize: 18, fontWeight: 700 }}>
                {capturedByRed.length} {capturedByRed.filter(p => p.isKing).length > 0 && `(${capturedByRed.filter(p => p.isKing).length}♛)`}
              </div>
            </div>
            <div>
              <div style={{ color: '#6a4030', fontSize: 9, letterSpacing: '0.1em', marginBottom: 4 }}>AI TOOK</div>
              <div style={{ color: '#9ca3af', fontSize: 18, fontWeight: 700 }}>
                {capturedByBlack.length} {capturedByBlack.filter(p => p.isKing).length > 0 && `(${capturedByBlack.filter(p => p.isKing).length}♛)`}
              </div>
            </div>
          </div>
        )}

        {/* Move history horizontal scroll */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, overflow: 'hidden',
        }}>
          <div style={{ padding: '5px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#6a5030', fontSize: 9, letterSpacing: '0.12em' }}>
            MOVE HISTORY
          </div>
          <div style={{ overflowX: 'auto', padding: '6px 8px', display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
            {movePairs.length === 0
              ? <p style={{ color: '#4a3820', fontSize: 11, fontStyle: 'italic' }}>No moves yet</p>
              : movePairs.map(p => (
                <div key={p.num} style={{ display: 'flex', gap: 3, fontSize: 11, flexShrink: 0, alignItems: 'center' }}>
                  <span style={{ color: '#5a4030' }}>{p.num}.</span>
                  <span style={{ color: '#f87171' }}>{p.red ?? ''}</span>
                  {p.black && <span style={{ color: '#9ca3af' }}>{p.black}</span>}
                </div>
              ))
            }
          </div>
        </div>

        {/* Resign */}
        {!isGameOver && (
          <button onClick={onResign} style={{
            background: 'transparent', border: '1px solid rgba(200,50,50,0.4)',
            borderRadius: 8, color: 'rgba(200,80,80,0.8)',
            fontSize: 11, letterSpacing: '0.1em',
            padding: '10px', cursor: 'pointer', width: '100%', textTransform: 'uppercase',
          }}>
            Resign Game
          </button>
        )}
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 230, minWidth: 200 }}>

      <div style={{
        background: config.gradient,
        border: `1px solid ${config.color}40`,
        borderRadius: 8, padding: '10px 14px', textAlign: 'center',
      }}>
        <div style={{ color: config.color, fontSize: 11, letterSpacing: '0.2em', fontWeight: 700 }}>{config.label}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2, }}>
          Bet: {config.cost} pts · Win: +{config.reward} pts
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, padding: '12px 14px', textAlign: 'center',
      }}>
        <div style={{ color: statusColor, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>
          {statusText}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8, padding: '12px',
      }}>
        <PieceCountRow />
      </div>

      {(capturedByRed.length > 0 || capturedByBlack.length > 0) && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, padding: '10px 12px',
          display: 'flex', gap: 16,
        }}>
          <div>
            <div style={{ color: '#6a4030', fontSize: 9, letterSpacing: '0.1em', marginBottom: 4 }}>YOU TOOK</div>
            <div style={{ color: '#f87171', fontSize: 22, fontWeight: 700 }}>
              {capturedByRed.length}
            </div>
          </div>
          <div>
            <div style={{ color: '#6a4030', fontSize: 9, letterSpacing: '0.1em', marginBottom: 4 }}>AI TOOK</div>
            <div style={{ color: '#9ca3af', fontSize: 22, fontWeight: 700 }}>
              {capturedByBlack.length}
            </div>
          </div>
        </div>
      )}

      <div style={{
        flex: 1, background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: 260,
      }}>
        <div style={{ padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#6a5030', fontSize: 9, letterSpacing: '0.15em' }}>
          MOVE HISTORY
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {movePairs.length === 0
            ? <p style={{ color: '#4a3820', fontSize: 12, textAlign: 'center', padding: '10px 0', fontStyle: 'italic' }}>No moves yet</p>
            : movePairs.map(p => (
              <div key={p.num} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr', gap: 2, padding: '2px 12px', fontSize: 12, }}>
                <span style={{ color: '#5a4030' }}>{p.num}.</span>
                <span style={{ color: '#f87171' }}>{p.red ?? ''}</span>
                <span style={{ color: '#9ca3af' }}>{p.black ?? ''}</span>
              </div>
            ))
          }
        </div>
      </div>

      {!isGameOver && (
        <button
          onClick={onResign}
          style={{
            background: 'transparent', border: '1px solid rgba(200,50,50,0.4)',
            borderRadius: 6, color: 'rgba(200,80,80,0.8)',
            fontSize: 11, letterSpacing: '0.1em',
            padding: '8px', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,50,50,0.15)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(200,80,80,0.8)'; }}
        >
          Resign Game
        </button>
      )}
    </div>
  );
};

export default GameStatus;
