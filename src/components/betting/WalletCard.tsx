import { Wallet, Plus, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletCardProps {
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export function WalletCard({ balance, onDeposit, onWithdraw }: WalletCardProps) {
  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-4 text-primary-foreground">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs opacity-80">Mon Solde</p>
          <p className="text-2xl font-black">{balance.toLocaleString()} FC</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onDeposit}
          size="sm"
          className="flex-1 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-none"
        >
          <Plus className="w-4 h-4 mr-1" />
          Déposer
        </Button>
        <Button
          onClick={onWithdraw}
          size="sm"
          variant="outline"
          className="flex-1 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ArrowDownToLine className="w-4 h-4 mr-1" />
          Retirer
        </Button>
      </div>
    </div>
  );
}
