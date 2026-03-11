import React, { useEffect, useRef } from 'react';
import { CheckerPiece } from '../types/checkers.types';

interface CheckerPieceProps {
  piece: CheckerPiece;
  size?: number;
}

// ─── Color Palettes ───────────────────────────────────────────────────────────

interface Pal {
  sideL: string; sideM: string; sideH: string; sideD: string;
  faceH: string; faceM: string; faceD: string; faceDrk: string;
  ring:  string; spec:  string; specDim: string;
  rimTop: string;
  crownBase: string; crownHi: string; crownDrk: string;
}

const RED: Pal = {
  sideL:   '#3b0000', sideM:   '#8b1a1a', sideH:   '#d94040', sideD:   '#1a0000',
  faceH:   '#ff8888', faceM:   '#dd2222', faceD:   '#991111', faceDrk: '#550000',
  ring:    'rgba(80,0,0,0.55)',
  spec:    'rgba(255,200,200,0.72)', specDim: 'rgba(255,160,160,0.28)',
  rimTop:  'rgba(255,120,120,0.35)',
  crownBase:'#c8940a', crownHi: '#ffe066', crownDrk: '#7a5500',
};

const BLK: Pal = {
  sideL:   '#0d0d0d', sideM:   '#282828', sideH:   '#505050', sideD:   '#060606',
  faceH:   '#909090', faceM:   '#3c3c3c', faceD:   '#1c1c1c', faceDrk: '#0a0a0a',
  ring:    'rgba(255,255,255,0.10)',
  spec:    'rgba(255,255,255,0.48)', specDim: 'rgba(255,255,255,0.15)',
  rimTop:  'rgba(200,200,200,0.22)',
  crownBase:'#bfa040', crownHi: '#ffe080', crownDrk: '#6a4800',
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

const CheckerPieceCanvas: React.FC<CheckerPieceProps> = ({ piece, size = 72 }) => {
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

    const pal = piece.color === 'red' ? RED : BLK;
    drawDisc(ctx, size, pal, piece.isKing);
  }, [piece.color, piece.isKing, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, display: 'block', pointerEvents: 'none' }}
      aria-label={`${piece.color}${piece.isKing ? ' king' : ''} checker`}
    />
  );
};

export default CheckerPieceCanvas;
