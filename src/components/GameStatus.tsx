import React from 'react';
import { GameState } from '../types/checkers.types';
import { LevelConfig, SIDE_BETS, SideBetId, SideBetState } from '../types/game.types';
import { getPieceCounts } from '../utils/checkersEngine';

interface GameStatusProps {
  gameState: GameState;
  config: LevelConfig;
  isAIThinking: boolean;
  onResign: () => void;
  isMobile?: boolean;
  boardWidth?: number;
  sideBetState: SideBetState;
}

function betProgress(id: SideBetId, sb: SideBetState): { met: boolean; label: string } {
  switch (id) {
    case 'firstBlood':
      if (sb.firstCapturePlayer === 'red') return { met: true, label: 'HIT' };
      if (sb.firstCapturePlayer === 'black') return { met: false, label: 'LOST' };
      return { met: false, label: 'pending' };
    case 'kingMe':
      return { met: sb.playerKingsCrowned >= 1, label: `${sb.playerKingsCrowned}/1` };
    case 'crush':
      return { met: sb.piecesCapturedByPlayer >= 5, label: `${sb.piecesCapturedByPlayer}/5` };
    case 'flawless':
      return { met: sb.piecesLostByPlayer === 0, label: sb.piecesLostByPlayer === 0 ? 'clean' : 'BROKEN' };
  }
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameState, config, isAIThinking, onResign,
  isMobile = false, boardWidth = 576, sideBetState,
}) => {
  const { currentTurn, isGameOver, winner, capturedByRed, capturedByBlack, moveHistory, board } = gameState;
  const counts = getPieceCounts(board);

  const statusText = (() => {
    if (isGameOver) return winner === 'red' ? '★ VICTORY' : winner === 'black' ? '★ HOUSE WINS' : '— DRAW —';
    if (isAIThinking) return '⟳ House thinking…';
    return currentTurn === 'red' ? 'Your play' : "House's play";
  })();

  const statusColor = (() => {
    if (isGameOver) return winner === 'red' ? '#4ade80' : winner === 'black' ? '#f04d5c' : '#f0c040';
    if (isAIThinking) return '#7dd3fc';
    return currentTurn === 'red' ? '#f0c040' : '#c8d0e0';
  })();

  const movePairs: { num: number; red?: string; black?: string }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      red: moveHistory[i]?.notation,
      black: moveHistory[i + 1]?.notation,
    });
  }

  const activeBetIds = (Object.keys(sideBetState.active) as SideBetId[]).filter(k => sideBetState.active[k]);

  const PieceCountRow = () => (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f0c040', fontSize: isMobile ? 22 : 20, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
          {counts.red}
        </div>
        <div style={{ color: '#8a7a4a', fontSize: 9, letterSpacing: '0.15em', fontFamily: "'Cinzel', serif" }}>
          YOU {counts.redKings > 0 ? `· ${counts.redKings}♛` : ''}
        </div>
      </div>
      <div style={{ color: '#4a3a1a', fontSize: 14, fontFamily: "'Cinzel', serif", letterSpacing: '0.15em' }}>VS</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#c8d0e0', fontSize: isMobile ? 22 : 20, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
          {counts.black}
        </div>
        <div style={{ color: '#8a7a4a', fontSize: 9, letterSpacing: '0.15em', fontFamily: "'Cinzel', serif" }}>
          HOUSE {counts.blackKings > 0 ? `· ${counts.blackKings}♛` : ''}
        </div>
      </div>
    </div>
  );

  const SideBetsBlock = () => (
    activeBetIds.length === 0 ? null : (
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,25,22,0.8), rgba(10,12,10,0.8))',
        border: '1px solid rgba(240,192,64,0.2)',
        borderRadius: 10, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ color: '#f0c040', fontSize: 9, letterSpacing: '0.2em', fontFamily: "'Cinzel', serif" }}>
          SIDE BETS · LIVE
        </div>
        {activeBetIds.map(id => {
          const bet = SIDE_BETS[id];
          const prog = betProgress(id, sideBetState);
          return (
            <div key={id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 11, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 4,
            }}>
              <span style={{ color: bet.color, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>
                {bet.label}
              </span>
              <span style={{
                color: prog.met ? '#4ade80' : prog.label === 'LOST' || prog.label === 'BROKEN' ? '#f04d5c' : '#8a7a4a',
                fontWeight: 700, fontFamily: "'Playfair Display', serif",
              }}>
                {prog.label}
              </span>
            </div>
          );
        })}
      </div>
    )
  );

  const TableBadge = () => (
    <div style={{
      background: config.gradient,
      border: `1px solid ${config.color}55`,
      borderRadius: 10, padding: '10px 14px', textAlign: 'center',
      boxShadow: `0 4px 16px ${config.glow}`,
    }}>
      <div style={{ color: config.color, fontSize: 11, letterSpacing: '0.25em', fontWeight: 700, fontFamily: "'Cinzel', serif" }}>
        {config.label}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, marginTop: 2, fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}>
        {config.cost}↓ · +{config.reward}↑
      </div>
    </div>
  );

  const StatusPanel = () => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20,25,22,0.8), rgba(10,12,10,0.8))',
      border: '1px solid rgba(240,192,64,0.18)',
      borderRadius: 10, padding: '12px 14px', textAlign: 'center',
    }}>
      <div style={{ color: statusColor, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', fontFamily: "'Cinzel', serif" }}>
        {statusText}
      </div>
    </div>
  );

  const CapturesBlock = () => (
    (capturedByRed.length > 0 || capturedByBlack.length > 0) ? (
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,25,22,0.6), rgba(10,12,10,0.6))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, padding: '10px 12px',
        display: 'flex', gap: 20, justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8a7a4a', fontSize: 9, letterSpacing: '0.15em', fontFamily: "'Cinzel', serif", marginBottom: 4 }}>YOU TOOK</div>
          <div style={{ color: '#f0c040', fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
            {capturedByRed.length}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8a7a4a', fontSize: 9, letterSpacing: '0.15em', fontFamily: "'Cinzel', serif", marginBottom: 4 }}>HOUSE TOOK</div>
          <div style={{ color: '#c8d0e0', fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
            {capturedByBlack.length}
          </div>
        </div>
      </div>
    ) : null
  );

  const ResignButton = () => (
    !isGameOver ? (
      <button onClick={onResign} style={{
        background: 'transparent', border: '1px solid rgba(240,77,92,0.4)',
        borderRadius: 10, color: '#f04d5c',
        fontSize: 11, letterSpacing: '0.18em', fontFamily: "'Cinzel', serif", fontWeight: 700,
        padding: isMobile ? '12px' : '10px', cursor: 'pointer',
        width: '100%', textTransform: 'uppercase',
      }}>
        Fold Hand
      </button>
    ) : null
  );

  if (isMobile) {
    return (
      <div style={{ width: boardWidth || '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}><StatusPanel /></div>
          <TableBadge />
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(20,25,22,0.6), rgba(10,12,10,0.6))',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <PieceCountRow />
        </div>

        <CapturesBlock />
        <SideBetsBlock />

        <div style={{
          background: 'linear-gradient(135deg, rgba(20,25,22,0.6), rgba(10,12,10,0.6))',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, overflow: 'hidden',
        }}>
          <div style={{
            padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: '#8a7a4a', fontSize: 9, letterSpacing: '0.18em', fontFamily: "'Cinzel', serif",
          }}>
            HAND HISTORY
          </div>
          <div style={{ overflowX: 'auto', padding: '6px 8px', display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
            {movePairs.length === 0
              ? <p style={{ color: '#4a3820', fontSize: 11, fontStyle: 'italic', fontFamily: "'Crimson Pro', serif" }}>No moves yet</p>
              : movePairs.map(p => (
                <div key={p.num} style={{ display: 'flex', gap: 3, fontSize: 11, flexShrink: 0, alignItems: 'center' }}>
                  <span style={{ color: '#5a4a2a' }}>{p.num}.</span>
                  <span style={{ color: '#f0c040' }}>{p.red ?? ''}</span>
                  {p.black && <span style={{ color: '#c8d0e0' }}>{p.black}</span>}
                </div>
              ))
            }
          </div>
        </div>

        <ResignButton />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 240, minWidth: 220 }}>
      <TableBadge />
      <StatusPanel />
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,25,22,0.6), rgba(10,12,10,0.6))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, padding: 12,
      }}>
        <PieceCountRow />
      </div>
      <CapturesBlock />
      <SideBetsBlock />

      <div style={{
        flex: 1, minHeight: 140,
        background: 'linear-gradient(135deg, rgba(20,25,22,0.6), rgba(10,12,10,0.6))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: 260,
      }}>
        <div style={{
          padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          color: '#8a7a4a', fontSize: 9, letterSpacing: '0.2em', fontFamily: "'Cinzel', serif",
        }}>
          HAND HISTORY
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {movePairs.length === 0
            ? <p style={{ color: '#4a3820', fontSize: 12, textAlign: 'center', padding: '10px 0', fontStyle: 'italic', fontFamily: "'Crimson Pro', serif" }}>Awaiting first move</p>
            : movePairs.map(p => (
              <div key={p.num} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr', gap: 2, padding: '2px 12px', fontSize: 12, fontFamily: "'Playfair Display', serif" }}>
                <span style={{ color: '#5a4a2a' }}>{p.num}.</span>
                <span style={{ color: '#f0c040' }}>{p.red ?? ''}</span>
                <span style={{ color: '#c8d0e0' }}>{p.black ?? ''}</span>
              </div>
            ))
          }
        </div>
      </div>

      <ResignButton />
    </div>
  );
};

export default GameStatus;
