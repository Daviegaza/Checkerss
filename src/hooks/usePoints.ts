import { useCallback, useState } from 'react';
import { GameResultType, INITIAL_POINTS, LevelConfig, PointsState } from '../types/game.types';

const STORAGE_KEY = 'checkers_points_v1';

function load(): PointsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PointsState;
  } catch { /* ignore */ }
  return { ...INITIAL_POINTS };
}

function save(pts: PointsState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pts)); } catch { /* ignore */ }
}

interface UsePointsReturn {
  points: PointsState;
  canAfford: (cost: number) => boolean;
  placeBet: (cost: number) => boolean;
  resolveBet: (result: GameResultType, config: LevelConfig) => number;
  resetPoints: () => void;
}

export function usePoints(): UsePointsReturn {
  const [points, setPoints] = useState<PointsState>(load);

  const canAfford = useCallback(
    (cost: number) => points.balance > cost,
    [points.balance]
  );

  const placeBet = useCallback((cost: number): boolean => {
    if (points.balance <= cost) return false;
    setPoints(prev => {
      const next = { ...prev, balance: prev.balance - cost };
      save(next);
      return next;
    });
    return true;
  }, [points.balance]);

  const resolveBet = useCallback((result: GameResultType, config: LevelConfig): number => {
    let delta = 0;
    setPoints(prev => {
      let next: PointsState;
      if (result === 'player_win') {
        delta = config.cost + config.reward;
        next = { ...prev, balance: prev.balance + delta, totalWins: prev.totalWins + 1, totalEarned: prev.totalEarned + config.reward };
      } else if (result === 'draw') {
        delta = config.cost;
        next = { ...prev, balance: prev.balance + delta, totalDraws: prev.totalDraws + 1 };
      } else {
        delta = -config.cost;
        next = { ...prev, totalLosses: prev.totalLosses + 1, totalLost: prev.totalLost + config.cost };
      }
      save(next);
      return next;
    });
    return delta;
  }, []);

  const resetPoints = useCallback(() => {
    const fresh = { ...INITIAL_POINTS };
    save(fresh);
    setPoints(fresh);
  }, []);

  return { points, canAfford, placeBet, resolveBet, resetPoints };
}
