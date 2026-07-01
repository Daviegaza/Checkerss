import React from 'react';
import { MISSION_TEMPLATES, MissionsState } from '../types/game.types';

interface MissionBoardProps {
  state: MissionsState;
  onClaim: (templateId: string) => void;
  onSfx: (name: 'chipClick' | 'coin' | 'missionComplete') => void;
}

const MissionBoard: React.FC<MissionBoardProps> = ({ state, onClaim, onSfx }) => {
  const claimedCount = state.missions.filter(m => m.claimed).length;

  return (
    <div style={{
      width: '100%', maxWidth: 960,
      background: 'linear-gradient(135deg, rgba(80,20,120,0.35) 0%, rgba(30,15,55,0.55) 100%)',
      border: '1px solid rgba(192,124,230,0.4)',
      borderRadius: 14, padding: '14px 18px', marginBottom: 20,
      boxShadow: '0 8px 32px rgba(120,60,180,0.2), inset 0 1px 0 rgba(192,124,230,0.15)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.25em',
          color: '#e0b0f0',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span style={{ fontSize: 16 }}>✧</span> DAILY MISSIONS
        </div>
        <div style={{ fontSize: 11, color: '#a880c0', fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}>
          {claimedCount} / {state.missions.length} CLAIMED · resets 00:00 UTC
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        {state.missions.map(m => {
          const tpl = MISSION_TEMPLATES.find(t => t.id === m.templateId);
          if (!tpl) return null;
          const pct = Math.min(100, (m.progress / m.target) * 100);
          const complete = m.progress >= m.target;
          const canClaim = complete && !m.claimed;

          return (
            <div key={m.templateId} style={{
              background: m.claimed
                ? 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(20,80,40,0.25))'
                : canClaim
                  ? 'linear-gradient(135deg, rgba(240,192,64,0.25), rgba(90,60,10,0.4))'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(20,10,35,0.5))',
              border: `1px solid ${m.claimed ? 'rgba(74,222,128,0.5)' : canClaim ? 'rgba(240,192,64,0.6)' : 'rgba(192,124,230,0.25)'}`,
              borderRadius: 12, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 6,
              boxShadow: canClaim ? '0 0 24px rgba(240,192,64,0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: canClaim
                    ? 'radial-gradient(circle at 30% 30%, #fce49a, #f0c040)'
                    : m.claimed
                      ? 'radial-gradient(circle at 30% 30%, #a8f0c0, #4ade80)'
                      : 'radial-gradient(circle at 30% 30%, rgba(192,124,230,0.6), rgba(80,40,120,0.6))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: '#1a0a20', fontWeight: 900,
                  flexShrink: 0,
                }}>{m.claimed ? '✓' : tpl.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.1em',
                    color: canClaim ? '#f0c040' : m.claimed ? '#4ade80' : '#e0b0f0',
                    fontWeight: 700,
                  }}>{tpl.label.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: '#a898b0', marginTop: 1, fontStyle: 'italic' }}>{tpl.hint}</div>
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 14, fontWeight: 800, color: '#f0c040', flexShrink: 0,
                }}>+{tpl.reward}</div>
              </div>

              <div style={{ height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.45)', overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: complete
                    ? 'linear-gradient(90deg, #f0c040, #f04d5c)'
                    : 'linear-gradient(90deg, #c07ce6, #7ce6ff)',
                  transition: 'width 0.4s ease',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <span style={{ color: '#a898b0', fontFamily: "'Playfair Display', serif" }}>
                  {m.progress.toLocaleString()} / {m.target.toLocaleString()}
                </span>
                {canClaim && (
                  <button
                    onClick={() => { onSfx('coin'); onClaim(m.templateId); onSfx('missionComplete'); }}
                    style={{
                      background: 'linear-gradient(135deg, #f0c040, #7a5a10)',
                      border: '1px solid rgba(240,192,64,0.7)',
                      borderRadius: 8, color: '#1a0a05',
                      fontSize: 11, letterSpacing: '0.15em', fontFamily: "'Cinzel', serif", fontWeight: 800,
                      padding: '5px 14px', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(240,192,64,0.4)',
                    }}
                  >CLAIM</button>
                )}
                {m.claimed && (
                  <span style={{ color: '#4ade80', fontFamily: "'Cinzel', serif", letterSpacing: '0.15em' }}>✓ DONE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MissionBoard;
