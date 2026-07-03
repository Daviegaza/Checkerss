import React, { useEffect, useRef } from 'react';
import { useSoundFX } from '../hooks/useSoundFX';

interface AgeGateProps {
  onAcknowledge: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onAcknowledge }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const { play } = useSoundFX();

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  const handleEnter = () => {
    play('fanfare');
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
        maxWidth: 520, width: '100%',
        background: 'linear-gradient(135deg, rgba(58,42,10,0.6) 0%, rgba(28,20,6,0.75) 100%)',
        border: '1px solid rgba(240,192,64,0.4)',
        borderRadius: 20, padding: '40px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 80px rgba(240,192,64,0.25)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 12, letterSpacing: '0.5em', color: '#8a7a4a', fontFamily: "'Cinzel', serif",
        }}>WELCOME TO</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 56, fontWeight: 900, letterSpacing: '0.08em',
          background: 'linear-gradient(180deg, #fce49a 0%, #f0c040 55%, #7a5a10 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: '8px 0 8px',
        }}>KINGFALL</div>
        <div style={{
          fontSize: 13, letterSpacing: '0.3em', color: '#c8a860', fontFamily: "'Cinzel', serif",
          marginBottom: 28,
        }}>ROYAL CHECKERS</div>

        <button
          ref={btnRef}
          onClick={handleEnter}
          className="kf-tap"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f0c040 0%, #7a5a10 100%)',
            border: '1px solid rgba(240,192,64,0.7)',
            borderRadius: 12, color: '#1a0a05',
            fontSize: 16, letterSpacing: '0.25em', fontFamily: "'Cinzel', serif", fontWeight: 800,
            padding: '16px', cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(240,192,64,0.5)',
            transition: 'all 0.2s ease',
          }}
        >ENTER THE FLOOR</button>
      </div>
    </div>
  );
};

export default AgeGate;
