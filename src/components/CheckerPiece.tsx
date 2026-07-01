import React, { useEffect, useRef } from 'react';
import { CheckerPiece } from '../types/checkers.types';
import { ChipSkinId, CHIP_SKINS } from '../types/game.types';

interface CheckerPieceProps {
  piece: CheckerPiece;
  size?: number;
  skinId?: ChipSkinId;
}

// ─── Color Palettes ───────────────────────────────────────────────────────────

interface Pal {
  sideL: string; sideM: string; sideH: string; sideD: string;
  faceH: string; faceM: string; faceD: string; faceDrk: string;
  ring:  string; spec:  string; specDim: string;
  rimTop: string;
  crownBase: string; crownHi: string; crownDrk: string;
}

// Player (red engine color) — burgundy chip with gold inlay
const RED: Pal = {
  sideL:   '#2a0510', sideM:   '#5c0e20', sideH:   '#8a1a2e', sideD:   '#12030a',
  faceH:   '#d84a5c', faceM:   '#8a1a2e', faceD:   '#4a0812', faceDrk: '#20040a',
  ring:    'rgba(240,192,64,0.55)',
  spec:    'rgba(255,220,150,0.65)', specDim: 'rgba(255,180,120,0.22)',
  rimTop:  'rgba(240,192,64,0.55)',
  crownBase:'#c8940a', crownHi: '#ffe066', crownDrk: '#5a3f00',
};

// House (black engine color) — onyx chip with platinum rim
const BLK: Pal = {
  sideL:   '#050508', sideM:   '#1a1a22', sideH:   '#3a3a48', sideD:   '#020204',
  faceH:   '#5a6070', faceM:   '#242630', faceD:   '#0e1018', faceDrk: '#050508',
  ring:    'rgba(200,208,224,0.28)',
  spec:    'rgba(220,225,235,0.55)', specDim: 'rgba(180,190,210,0.18)',
  rimTop:  'rgba(200,208,224,0.35)',
  crownBase:'#c8d0e0', crownHi: '#ffffff', crownDrk: '#4a5060',
};

// ─── Draw Helpers ─────────────────────────────────────────────────────────────

function drawDisc(
  ctx: CanvasRenderingContext2D,
  s: number,
  pal: Pal,
  isKing: boolean
) {
  const cx  = s * 0.50;
  const rx  = s * 0.390;          // x radius of top ellipse
  const ry  = s * 0.115;          // y radius (perspective foreshortening)
  const topY = s * 0.320;         // center y of top face
  const botY = s * 0.600;         // center y of bottom edge
  const sh   = botY - topY;       // visible side height

  // ── Shadow ──
  const shG = ctx.createRadialGradient(cx, s * 0.815, 0, cx, s * 0.815, rx * 1.05);
  shG.addColorStop(0.00, 'rgba(0,0,0,0.55)');
  shG.addColorStop(0.50, 'rgba(0,0,0,0.22)');
  shG.addColorStop(1.00, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.ellipse(cx, s * 0.815, rx * 1.05, ry * 1.10, 0, 0, Math.PI * 2);
  ctx.fillStyle = shG;
  ctx.fill();

  // ── Cylinder sides ──
  // Path: bottom-left arc → left edge up → top arc → right edge down
  ctx.beginPath();
  ctx.moveTo(cx - rx, botY);
  ctx.ellipse(cx, botY, rx, ry, 0, Math.PI, 0, false); // bottom half bottom ellipse
  ctx.lineTo(cx + rx, topY);
  ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI, false); // bottom half top ellipse
  ctx.closePath();

  const sideG = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  sideG.addColorStop(0.00, pal.sideD);
  sideG.addColorStop(0.18, pal.sideL);
  sideG.addColorStop(0.36, pal.sideH);
  sideG.addColorStop(0.50, pal.sideM);
  sideG.addColorStop(0.64, pal.sideH);
  sideG.addColorStop(0.82, pal.sideL);
  sideG.addColorStop(1.00, pal.sideD);
  ctx.fillStyle = sideG;
  ctx.fill();

  // ── Thin rim line at top of side ──
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = pal.rimTop;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Top face ──
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
  const faceG = ctx.createRadialGradient(
    cx - rx * 0.30, topY - ry * 0.42, rx * 0.03,
    cx + rx * 0.10, topY + ry * 0.10, rx * 1.05
  );
  faceG.addColorStop(0.00, pal.faceH);
  faceG.addColorStop(0.22, pal.faceM);
  faceG.addColorStop(0.60, pal.faceD);
  faceG.addColorStop(1.00, pal.faceDrk);
  ctx.fillStyle = faceG;
  ctx.fill();

  // ── Inner ring engraving ──
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx * 0.70, ry * 0.70, 0, 0, Math.PI * 2);
  ctx.strokeStyle = pal.ring;
  ctx.lineWidth = s * 0.025;
  ctx.stroke();

  // ── Outer rim on top face ──
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx * 0.94, ry * 0.94, 0, 0, Math.PI * 2);
  ctx.strokeStyle = pal.ring;
  ctx.lineWidth = s * 0.018;
  ctx.stroke();

  // ── Specular highlight ──
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  // Main specular blob
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.28, topY - ry * 0.35, rx * 0.32, ry * 0.30, -0.35, 0, Math.PI * 2);
  ctx.fillStyle = pal.spec;
  ctx.fill();
  // Secondary soft glow
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.18, topY - ry * 0.18, rx * 0.50, ry * 0.50, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = pal.specDim;
  ctx.fill();
  ctx.restore();

  // ── King crown ──
  if (isKing) {
    drawCrown(ctx, cx, topY, rx, ry, pal);
  }
}

// ─── Crown ───────────────────────────────────────────────────────────────────

function drawCrown(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number,
  pal: Pal
) {
  const cr = rx * 0.46;
  const cr_y = ry * 0.44;

  // Crown base band (thick ellipse)
  ctx.beginPath();
  ctx.ellipse(cx, cy, cr, cr_y * 1.15, 0, 0, Math.PI * 2);
  const bandG = ctx.createRadialGradient(cx - cr * 0.28, cy - cr_y * 0.3, 0, cx, cy, cr);
  bandG.addColorStop(0.00, pal.crownHi);
  bandG.addColorStop(0.40, pal.crownBase);
  bandG.addColorStop(1.00, pal.crownDrk);
  ctx.fillStyle = bandG;
  ctx.fill();

  // Five points / orbs on crown
  const orbs = [
    { x: cx,              y: cy - cr_y * 2.20, r: cr * 0.22 }, // top center
    { x: cx - cr * 0.56, y: cy - cr_y * 1.55, r: cr * 0.17 }, // upper left
    { x: cx + cr * 0.56, y: cy - cr_y * 1.55, r: cr * 0.17 }, // upper right
    { x: cx - cr * 0.95, y: cy - cr_y * 0.80, r: cr * 0.14 }, // lower left
    { x: cx + cr * 0.95, y: cy - cr_y * 0.80, r: cr * 0.14 }, // lower right
  ];

  // Connect orbs with thin lines (crown tines)
  ctx.strokeStyle = pal.crownBase;
  ctx.lineWidth = cr * 0.18;
  ctx.lineCap = 'round';
  orbs.forEach(orb => {
    ctx.beginPath();
    ctx.moveTo(orb.x, cy);
    ctx.lineTo(orb.x, orb.y + orb.r);
    ctx.stroke();
  });

  // Draw each orb
  orbs.forEach(orb => {
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
    const og = ctx.createRadialGradient(
      orb.x - orb.r * 0.3, orb.y - orb.r * 0.3, 0,
      orb.x, orb.y, orb.r
    );
    og.addColorStop(0, pal.crownHi);
    og.addColorStop(0.5, pal.crownBase);
    og.addColorStop(1, pal.crownDrk);
    ctx.fillStyle = og;
    ctx.fill();
  });
}

// ─── React Component ─────────────────────────────────────────────────────────

// Convert a hex accent into a Pal by darkening/lightening
function hexToRgb(h: string): [number, number, number] {
  const s = h.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}
function shade(h: string, amt: number): string {
  const [r, g, b] = hexToRgb(h);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const nr = clamp(r + amt), ng = clamp(g + amt), nb = clamp(b + amt);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}
function palFromAccent(accent: string, isHouse: boolean): Pal {
  return {
    sideL:   shade(accent, -100),
    sideM:   shade(accent, -55),
    sideH:   shade(accent, -15),
    sideD:   shade(accent, -130),
    faceH:   shade(accent, +40),
    faceM:   shade(accent, -30),
    faceD:   shade(accent, -70),
    faceDrk: shade(accent, -110),
    ring:    isHouse ? 'rgba(200,208,224,0.28)' : 'rgba(240,192,64,0.55)',
    spec:    isHouse ? 'rgba(220,225,235,0.55)' : 'rgba(255,220,150,0.65)',
    specDim: isHouse ? 'rgba(180,190,210,0.18)' : 'rgba(255,180,120,0.22)',
    rimTop:  isHouse ? 'rgba(200,208,224,0.35)' : 'rgba(240,192,64,0.55)',
    crownBase: '#c8940a', crownHi: '#ffe066', crownDrk: '#5a3f00',
  };
}

const CheckerPieceCanvas: React.FC<CheckerPieceProps> = ({ piece, size = 72, skinId = 'classic' }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    let pal: Pal;
    if (skinId === 'classic') {
      pal = piece.color === 'red' ? RED : BLK;
    } else {
      const skin = CHIP_SKINS[skinId] || CHIP_SKINS.classic;
      pal = piece.color === 'red'
        ? palFromAccent(skin.playerColor, false)
        : palFromAccent(skin.houseColor, true);
    }
    drawDisc(ctx, size, pal, piece.isKing);
  }, [piece.color, piece.isKing, size, skinId]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, display: 'block', pointerEvents: 'none' }}
      aria-label={`${piece.color}${piece.isKing ? ' king' : ''} checker`}
    />
  );
};

export default CheckerPieceCanvas;
