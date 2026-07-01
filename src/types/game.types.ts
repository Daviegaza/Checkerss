// ─── Difficulty & Levels ──────────────────────────────────────────────────────

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert' | 'highroller';

export interface LevelConfig {
  level: DifficultyLevel;
  label: string;
  tagline: string;
  cost: number;
  reward: number;
  jackpotContribution: number; // chips added to jackpot each play
  description: string;
  aiDepth: number;
  color: string;
  glow: string;
  gradient: string;
  vipRequired: number;
}

export const LEVEL_CONFIGS: Record<DifficultyLevel, LevelConfig> = {
  easy: {
    level: 'easy',
    label: 'BRONZE',
    tagline: 'Warm-up table',
    cost: 5,
    reward: 5,
    jackpotContribution: 1,
    description: 'AI plays random moves. Perfect for learning the ropes.',
    aiDepth: 0,
    color: '#c48a3c',
    glow: 'rgba(196,138,60,0.55)',
    gradient: 'linear-gradient(135deg, #3a230a 0%, #5a3a12 100%)',
    vipRequired: 0,
  },
  medium: {
    level: 'medium',
    label: 'SILVER',
    tagline: 'Sharp reads',
    cost: 15,
    reward: 20,
    jackpotContribution: 2,
    description: 'Minimax depth-2. The AI starts thinking ahead.',
    aiDepth: 2,
    color: '#c8d0e0',
    glow: 'rgba(200,208,224,0.55)',
    gradient: 'linear-gradient(135deg, #1e2432 0%, #2b3448 100%)',
    vipRequired: 0,
  },
  hard: {
    level: 'hard',
    label: 'GOLD',
    tagline: 'Serious action',
    cost: 40,
    reward: 60,
    jackpotContribution: 5,
    description: 'Depth-4 with alpha-beta pruning. A real battle.',
    aiDepth: 4,
    color: '#f0c040',
    glow: 'rgba(240,192,64,0.6)',
    gradient: 'linear-gradient(135deg, #3a2a08 0%, #5c4210 100%)',
    vipRequired: 1,
  },
  expert: {
    level: 'expert',
    label: 'RUBY',
    tagline: 'High stakes',
    cost: 100,
    reward: 180,
    jackpotContribution: 12,
    description: 'Depth-6 search + positional tables. Rarely beaten.',
    aiDepth: 6,
    color: '#f04d5c',
    glow: 'rgba(240,77,92,0.65)',
    gradient: 'linear-gradient(135deg, #3a0a12 0%, #6a0e20 100%)',
    vipRequired: 2,
  },
  highroller: {
    level: 'highroller',
    label: 'DIAMOND',
    tagline: 'High roller',
    cost: 250,
    reward: 550,
    jackpotContribution: 30,
    description: 'Depth-8 endgame precision. Only diamonds survive.',
    aiDepth: 8,
    color: '#7ce6ff',
    glow: 'rgba(124,230,255,0.65)',
    gradient: 'linear-gradient(135deg, #062432 0%, #0a4560 100%)',
    vipRequired: 4,
  },
};

// ─── App Screen ───────────────────────────────────────────────────────────────

export type GameScreen = 'lobby' | 'playing' | 'result';

// ─── Side Bets (skill-adjacent parlays inside one round) ──────────────────────

export type SideBetId = 'firstBlood' | 'kingMe' | 'crush' | 'flawless';

export interface SideBetConfig {
  id: SideBetId;
  label: string;
  hint: string;
  cost: number;
  payoutMultiplier: number; // profit multiple on wager (returned = stake + stake*payoutMultiplier)
  color: string;
}

export const SIDE_BETS: Record<SideBetId, SideBetConfig> = {
  firstBlood: {
    id: 'firstBlood',
    label: 'First Blood',
    hint: 'You make the first capture of the round.',
    cost: 5,
    payoutMultiplier: 1.5,
    color: '#f04d5c',
  },
  kingMe: {
    id: 'kingMe',
    label: 'King Me',
    hint: 'You crown at least one king this round.',
    cost: 10,
    payoutMultiplier: 2,
    color: '#f0c040',
  },
  crush: {
    id: 'crush',
    label: 'Crush',
    hint: 'You capture 5+ enemy pieces this round.',
    cost: 15,
    payoutMultiplier: 3,
    color: '#7ce6ff',
  },
  flawless: {
    id: 'flawless',
    label: 'Flawless',
    hint: 'Win without losing a single piece.',
    cost: 25,
    payoutMultiplier: 8,
    color: '#4ade80',
  },
};

export interface SideBetState {
  active: Record<SideBetId, boolean>;
  firstCapturePlayer: 'red' | 'black' | null;
  playerKingsCrowned: number;
  piecesCapturedByPlayer: number;
  piecesLostByPlayer: number;
}

export function makeInitialSideBetState(): SideBetState {
  return {
    active: { firstBlood: false, kingMe: false, crush: false, flawless: false },
    firstCapturePlayer: null,
    playerKingsCrowned: 0,
    piecesCapturedByPlayer: 0,
    piecesLostByPlayer: 0,
  };
}

// ─── Game Result ──────────────────────────────────────────────────────────────

export type GameResultType = 'player_win' | 'computer_win' | 'draw';

export interface SideBetOutcome {
  id: SideBetId;
  won: boolean;
  payout: number;
  stake: number;
}

export interface RoundMetricDelta {
  roundsPlayed: number;
  roundsWon: number;
  piecesCaptured: number;
  kingsCrowned: number;
  sideBetsWon: number;
  streakLen: number;
  chipsWon: number;
}

export interface MissionProgressReport {
  templateId: string;
  before: number;
  after: number;
  target: number;
  justCompleted: boolean;
}

export interface GameResult {
  type: GameResultType;
  reason: string;
  pointsChange: number;
  basePayout: number;
  streakBonus: number;
  sideBetOutcomes: SideBetOutcome[];
  jackpotHit: boolean;
  jackpotAmount: number;
  jackpotTierHit: JackpotTierId | null;
  newAchievements: Achievement[];
  vipXpGained: number;
  missionReports: MissionProgressReport[];
}

// ─── Multi-tier Jackpot ───────────────────────────────────────────────────────

export type JackpotTierId = 'mini' | 'minor' | 'major' | 'grand';

export interface JackpotTierDef {
  id: JackpotTierId;
  label: string;
  color: string;
  seed: number;
  baseHitChance: number;
  contributionShare: number;
}

export const JACKPOT_TIERS: Record<JackpotTierId, JackpotTierDef> = {
  mini:  { id: 'mini',  label: 'MINI',  color: '#7ce6ff', seed: 100,   baseHitChance: 1 / 40,   contributionShare: 0.20 },
  minor: { id: 'minor', label: 'MINOR', color: '#4ade80', seed: 300,   baseHitChance: 1 / 160,  contributionShare: 0.30 },
  major: { id: 'major', label: 'MAJOR', color: '#f0c040', seed: 800,   baseHitChance: 1 / 700,  contributionShare: 0.30 },
  grand: { id: 'grand', label: 'GRAND', color: '#f04d5c', seed: 2500,  baseHitChance: 1 / 3500, contributionShare: 0.20 },
};

export const JACKPOT_TIER_ORDER: JackpotTierId[] = ['mini', 'minor', 'major', 'grand'];

export function initialJackpotPots(): Record<JackpotTierId, number> {
  return {
    mini:  JACKPOT_TIERS.mini.seed,
    minor: JACKPOT_TIERS.minor.seed,
    major: JACKPOT_TIERS.major.seed,
    grand: JACKPOT_TIERS.grand.seed,
  };
}

// ─── Daily Missions ───────────────────────────────────────────────────────────

export type MissionMetric =
  | 'roundsPlayed' | 'roundsWon' | 'piecesCaptured'
  | 'kingsCrowned' | 'sideBetsWon' | 'streakLen' | 'chipsWon';

export interface MissionTemplate {
  id: string;
  label: string;
  hint: string;
  metric: MissionMetric;
  target: number;
  reward: number;
  icon: string;
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  { id: 'play_3',    label: 'Warm Seat',     hint: 'Play 3 rounds today.',        metric: 'roundsPlayed',   target: 3,   reward: 40,  icon: '♠' },
  { id: 'win_2',     label: 'Winner Winner', hint: 'Win 2 rounds today.',         metric: 'roundsWon',      target: 2,   reward: 100, icon: '♛' },
  { id: 'cap_10',    label: 'Sharp Blade',   hint: 'Capture 10 pieces today.',    metric: 'piecesCaptured', target: 10,  reward: 75,  icon: '⚔' },
  { id: 'crown_2',   label: 'Crownsmith',    hint: 'Crown 2 kings today.',        metric: 'kingsCrowned',   target: 2,   reward: 90,  icon: '♚' },
  { id: 'sidebet_1', label: 'Table Whisper', hint: 'Hit 1 side bet today.',       metric: 'sideBetsWon',    target: 1,   reward: 60,  icon: '★' },
  { id: 'streak_2',  label: 'Momentum',      hint: 'Reach a 2-game streak.',      metric: 'streakLen',      target: 2,   reward: 120, icon: '✦' },
  { id: 'chips_200', label: 'Payday',        hint: 'Earn 200 net chips today.',   metric: 'chipsWon',       target: 200, reward: 150, icon: '◈' },
  { id: 'win_gold',  label: 'Big Leagues',   hint: 'Win 1 at Gold+ table.',       metric: 'roundsWon',      target: 1,   reward: 200, icon: '◆' },
];

export interface DailyMission {
  templateId: string;
  progress: number;
  target: number;
  claimed: boolean;
}

export interface MissionsState {
  seedDay: number;
  missions: DailyMission[];
}

// ─── Chip / Board Skins ───────────────────────────────────────────────────────

export type ChipSkinId = 'classic' | 'ivory' | 'sapphire' | 'emerald' | 'violet';

export interface ChipSkinDef {
  id: ChipSkinId;
  label: string;
  playerColor: string;
  houseColor: string;
  boardDark: string;
  boardLight: string;
  vipRequired: number;
}

export const CHIP_SKINS: Record<ChipSkinId, ChipSkinDef> = {
  classic:  { id: 'classic',  label: 'Kingfall',   playerColor: '#f0c040', houseColor: '#c8d0e0', boardDark: '#1a5a3e', boardLight: '#f2dfa8', vipRequired: 0 },
  ivory:    { id: 'ivory',    label: 'Ivory Room', playerColor: '#fce49a', houseColor: '#8a5a30', boardDark: '#3a2818', boardLight: '#f4e8c8', vipRequired: 0 },
  sapphire: { id: 'sapphire', label: 'Sapphire',   playerColor: '#7ce6ff', houseColor: '#c8d0e0', boardDark: '#0e3a5a', boardLight: '#dce8f4', vipRequired: 1 },
  emerald:  { id: 'emerald',  label: 'Emerald',    playerColor: '#4ade80', houseColor: '#c8d0e0', boardDark: '#0e4a2a', boardLight: '#e0f0d4', vipRequired: 2 },
  violet:   { id: 'violet',   label: 'Violet VIP', playerColor: '#c07ce6', houseColor: '#f0c040', boardDark: '#3a1a5a', boardLight: '#eadff0', vipRequired: 3 },
};

export const CHIP_SKIN_ORDER: ChipSkinId[] = ['classic', 'ivory', 'sapphire', 'emerald', 'violet'];

// ─── Points / Wallet ──────────────────────────────────────────────────────────

export interface PointsState {
  balance: number;
  jackpot: number;
  jackpotTiers: Record<JackpotTierId, number>;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalEarned: number;
  totalLost: number;
  winStreak: number;
  bestStreak: number;
  biggestWin: number;
  vipXp: number;
  lastDailyBonusAt: number;
  unlockedAchievements: string[];
  activeSkin: ChipSkinId;
  unlockedSkins: ChipSkinId[];
  ageAcknowledged: boolean;
}

export const INITIAL_JACKPOT = JACKPOT_TIERS.mini.seed + JACKPOT_TIERS.minor.seed +
  JACKPOT_TIERS.major.seed + JACKPOT_TIERS.grand.seed;

export const INITIAL_POINTS: PointsState = {
  balance: 100,
  jackpot: INITIAL_JACKPOT,
  jackpotTiers: initialJackpotPots(),
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  totalEarned: 0,
  totalLost: 0,
  winStreak: 0,
  bestStreak: 0,
  biggestWin: 0,
  vipXp: 0,
  lastDailyBonusAt: 0,
  unlockedAchievements: [],
  activeSkin: 'classic',
  unlockedSkins: ['classic', 'ivory'],
  ageAcknowledged: false,
};

// ─── Streak → Multiplier ──────────────────────────────────────────────────────
export function streakMultiplier(streak: number): number {
  if (streak >= 8) return 3.0;
  if (streak >= 5) return 2.0;
  if (streak >= 3) return 1.5;
  if (streak >= 2) return 1.25;
  return 1;
}

// ─── VIP tiers ────────────────────────────────────────────────────────────────

export interface VipTier {
  tier: number;
  label: string;
  xpRequired: number;
  color: string;
  perk: string;
}

export const VIP_TIERS: VipTier[] = [
  { tier: 0, label: 'Guest',    xpRequired: 0,     color: '#8a7a5a', perk: 'Access to Bronze + Silver tables.' },
  { tier: 1, label: 'Regular',  xpRequired: 150,   color: '#c8a45a', perk: 'Unlock Gold tables.' },
  { tier: 2, label: 'Silver',   xpRequired: 500,   color: '#c8d0e0', perk: 'Unlock Ruby tables. +5% daily bonus.' },
  { tier: 3, label: 'Gold',     xpRequired: 1500,  color: '#f0c040', perk: '+10% daily bonus.' },
  { tier: 4, label: 'Diamond',  xpRequired: 4000,  color: '#7ce6ff', perk: 'Unlock Diamond high-roller table.' },
  { tier: 5, label: 'Whale',    xpRequired: 10000, color: '#c07ce6', perk: '+20% daily bonus. Jackpot odds boost.' },
];

export function vipTierFor(xp: number): VipTier {
  let cur = VIP_TIERS[0];
  for (const t of VIP_TIERS) {
    if (xp >= t.xpRequired) cur = t;
  }
  return cur;
}

export function nextVipTier(xp: number): VipTier | null {
  for (const t of VIP_TIERS) {
    if (xp < t.xpRequired) return t;
  }
  return null;
}

// ─── Daily Bonus ──────────────────────────────────────────────────────────────

export const DAILY_BONUS_MS = 20 * 60 * 60 * 1000; // 20h cooldown
export const DAILY_BONUS_BASE = 50;

export function dailyBonusAmount(vipTier: number): number {
  const boost = vipTier >= 5 ? 1.2 : vipTier >= 3 ? 1.1 : vipTier >= 2 ? 1.05 : 1;
  return Math.floor(DAILY_BONUS_BASE * boost);
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  label: string;
  hint: string;
  reward: number;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win',    label: 'First Blood',     hint: 'Win your first round.',                 reward: 25,  icon: '◎' },
  { id: 'streak_3',     label: 'Hot Hand',        hint: 'Win 3 rounds in a row.',                reward: 50,  icon: '✦' },
  { id: 'streak_5',     label: 'On Fire',         hint: 'Win 5 rounds in a row.',                reward: 150, icon: '✵' },
  { id: 'crush_5',      label: 'Executioner',     hint: 'Capture 5+ pieces in one round.',       reward: 75,  icon: '⚔' },
  { id: 'flawless',     label: 'Untouchable',     hint: 'Win without losing a piece.',           reward: 200, icon: '◈' },
  { id: 'jackpot',      label: 'Jackpot!',        hint: 'Hit the progressive jackpot.',          reward: 0,   icon: '★' },
  { id: 'gold_table',   label: 'Big Leagues',     hint: 'Win at Gold table or higher.',          reward: 100, icon: '♛' },
  { id: 'diamond_win',  label: 'Diamond Dynasty', hint: 'Win at the Diamond high-roller table.', reward: 500, icon: '◇' },
];

// ─── Jackpot ──────────────────────────────────────────────────────────────────

export function jackpotHitChance(cfg: LevelConfig, vipTier: number): number {
  const base = 1 / 500;
  const tierBoost = 1 + cfg.jackpotContribution / 30;
  const whaleBoost = vipTier >= 5 ? 1.5 : 1;
  return base * tierBoost * whaleBoost;
}
