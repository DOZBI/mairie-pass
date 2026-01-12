import { useState, useCallback, useMemo } from 'react';
import { Odds, Match, getMatchById } from '@/lib/sportmonks-mock';

export interface BetSelection {
  id: string;
  matchId: number;
  matchName: string;
  market: string;
  label: string;
  odds: number;
  localTeam: string;
  visitorTeam: string;
}

export function useBetSlip() {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<number>(500);

  const addSelection = useCallback((odds: Odds) => {
    const match = getMatchById(odds.matchId);
    if (!match) return;

    // Remove if same selection exists
    setSelections(prev => {
      const exists = prev.find(s => s.id === odds.id);
      if (exists) {
        return prev.filter(s => s.id !== odds.id);
      }
      
      // Remove any selection from the same match with same market
      const filtered = prev.filter(s => !(s.matchId === odds.matchId && s.market === odds.market));
      
      return [...filtered, {
        id: odds.id,
        matchId: odds.matchId,
        matchName: match.name,
        market: odds.market,
        label: odds.label,
        odds: odds.value,
        localTeam: match.localTeam.name,
        visitorTeam: match.visitorTeam.name,
      }];
    });
  }, []);

  const removeSelection = useCallback((id: string) => {
    setSelections(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearSlip = useCallback(() => {
    setSelections([]);
    setStake(500);
  }, []);

  const isSelected = useCallback((oddsId: string) => {
    return selections.some(s => s.id === oddsId);
  }, [selections]);

  const totalOdds = useMemo(() => {
    if (selections.length === 0) return 0;
    return selections.reduce((acc, s) => acc * s.odds, 1);
  }, [selections]);

  const potentialWin = useMemo(() => {
    return stake * totalOdds;
  }, [stake, totalOdds]);

  return {
    selections,
    stake,
    setStake,
    addSelection,
    removeSelection,
    clearSlip,
    isSelected,
    totalOdds,
    potentialWin,
    count: selections.length,
  };
}
