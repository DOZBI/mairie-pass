import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ChevronUp, ChevronDown, Ticket, Loader2 } from 'lucide-react';
import { BetSelection } from '@/hooks/useBetSlip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface BetSlipProps {
  selections: BetSelection[];
  stake: number;
  setStake: (stake: number) => void;
  removeSelection: (id: string) => void;
  clearSlip: () => void;
  totalOdds: number;
  potentialWin: number;
  walletBalance: number;
  onPlaceBet: () => Promise<void>;
}

const QUICK_STAKES = [500, 1000, 2000, 5000];

export function BetSlip({
  selections,
  stake,
  setStake,
  removeSelection,
  clearSlip,
  totalOdds,
  potentialWin,
  walletBalance,
  onPlaceBet,
}: BetSlipProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);
  const { toast } = useToast();

  const handlePlaceBet = async () => {
    if (stake > walletBalance) {
      toast({
        title: "Solde insuffisant",
        description: "Rechargez votre portefeuille pour placer ce pari.",
        variant: "destructive",
      });
      return;
    }
    
    if (selections.length === 0) {
      toast({
        title: "Aucune sélection",
        description: "Ajoutez au moins une cote à votre ticket.",
        variant: "destructive",
      });
      return;
    }

    setIsPlacing(true);
    try {
      await onPlaceBet();
      toast({
        title: "Pari placé !",
        description: `Mise: ${stake.toLocaleString()} FC - Gain potentiel: ${potentialWin.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FC`,
      });
      clearSlip();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de placer le pari. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsPlacing(false);
    }
  };

  if (selections.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Ticket de Pari</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          Cliquez sur une cote pour ajouter une sélection
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-primary/10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">Ticket ({selections.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); clearSlip(); }}
            className="p-1 hover:bg-destructive/20 rounded text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Selections */}
            <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
              {selections.map((sel) => (
                <motion.div
                  key={sel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {sel.localTeam} vs {sel.visitorTeam}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {sel.market}: {sel.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-bold text-primary">{sel.odds.toFixed(2)}</span>
                    <button
                      onClick={() => removeSelection(sel.id)}
                      className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total Odds */}
            <div className="px-3 py-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cote totale</span>
                <span className="font-bold text-primary">{totalOdds.toFixed(2)}</span>
              </div>
            </div>

            {/* Stake input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2 mb-3">
                {QUICK_STAKES.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setStake(amount)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      stake === amount
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {amount >= 1000 ? `${amount / 1000}K` : amount}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Math.max(0, parseInt(e.target.value) || 0))}
                  className="pr-12 bg-muted border-none text-lg font-bold text-center"
                  min={100}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  FC
                </span>
              </div>
            </div>

            {/* Potential win */}
            <div className="px-3 py-2 bg-primary/5 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gain potentiel</span>
                <span className="text-xl font-black text-primary">
                  {potentialWin.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FC
                </span>
              </div>
            </div>

            {/* Place bet button */}
            <div className="p-3 border-t border-border">
              <Button
                onClick={handlePlaceBet}
                disabled={isPlacing || stake > walletBalance || stake < 100}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base"
              >
                {isPlacing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : stake > walletBalance ? (
                  'Solde insuffisant'
                ) : (
                  `Parier ${stake.toLocaleString()} FC`
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
