import React, { useEffect, useRef, useState } from 'react';
import { useSoundFX } from '../hooks/useSoundFX';

interface AgeGateProps {
  onAcknowledge: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onAcknowledge }) => {
  const [checked, setChecked] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { play } = useSoundFX();

  // Autofocus the primary CTA once eligible, otherwise focus the checkbox label region
  useEffect(() => {
    if (checked && btnRef.current) btnRef.current.focus();
  }, [checked]);

  const handleAccept = () => {
    play('coin');
    onAcknowledge();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'radial-gradient(ellipse at center, rgba(30,20,50,0.98) 0%, rgba(5,10,20,0.99) 100%)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, color: '#f0e6cf',
    }}>
      <div style={{
        maxWidth: 460, width: '100%',
        background: 'linear-gradient(135deg, rgba(58,42,10,0.6) 0%, rgba(28,20,6,0.75) 100%)',
        border: '1px solid rgba(240,192,64,0.4)',
        borderRadius: 20, padding: '32px 28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 60px rgba(240,192,64,0.2)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 12, letterSpacing: '0.4em', color: '#8a7a4a', fontFamily: "'Cinzel', serif",
        }}>WELCOME TO</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 44, fontWeight: 900, letterSpacing: '0.08em',
          background: 'linear-gradient(180deg, #fce49a 0%, #f0c040 55%, #7a5a10 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: '4px 0 20px',
        }}>KINGFALL</div>

        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#c8b078', marginBottom: 20, fontFamily: "'Crimson Pro', serif" }}>
          Skill-based checkers with virtual chips. <b style={{ color: '#f0c040' }}>No real money. No cash value. No deposits.</b>{' '}
          Chips are earned by winning against the AI and reset if you run out.
        </p>

        <div style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(240,77,92,0.3)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 20,
          fontSize: 11, color: '#f89ea8', fontStyle: 'italic',
        }}>
          You must be 18+ to enter. If gambling ever feels compulsive, contact{' '}
          <a href="https://www.ncpgambling.org/help-treatment/help-by-state/" target="_blank" rel="noopener noreferrer"
             style={{ color: '#ff8ea0' }}>NCPG</a>.
        </div>

        <label style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
          border: `1px solid ${checked ? '#f0c040' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10, cursor: 'pointer', marginBottom: 16,
          transition: 'all 0.2s ease',
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#f0c040', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, color: '#e8dcb0', textAlign: 'left', lineHeight: 1.4 }}>
            I'm 18+ and understand these are virtual chips with no cash value.
          </span>
        </label>

        <button
          ref={btnRef}
          onClick={handleAccept}
          disabled={!checked}
          className="kf-tap"
          style={{
            width: '100%',
            background: checked
              ? 'linear-gradient(135deg, #f0c040 0%, #7a5a10 100%)'
              : 'rgba(80,60,20,0.5)',
            border: `1px solid ${checked ? 'rgba(240,192,64,0.7)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 12, color: checked ? '#1a0a05' : '#5a4a2a',
            fontSize: 14, letterSpacing: '0.2em', fontFamily: "'Cinzel', serif", fontWeight: 800,
            padding: '14px', cursor: checked ? 'pointer' : 'not-allowed',
            boxShadow: checked ? '0 6px 20px rgba(240,192,64,0.4)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >ENTER THE FLOOR</button>
      </div>
    </div>
  );
};

export default AgeGate;
