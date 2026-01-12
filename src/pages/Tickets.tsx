import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { liveMatches, upcomingMatches, Match, Odds } from '@/lib/sportmonks-mock';
import { useBetSlip } from '@/hooks/useBetSlip';
import { useWallet } from '@/hooks/useWallet';
import { MatchCard } from '@/components/betting/MatchCard';
import { BetSlip } from '@/components/betting/BetSlip';
import { WalletCard } from '@/components/betting/WalletCard';
import { MobileMoneyModal } from '@/components/betting/MobileMoneyModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const fetchMatches = async (): Promise<{ live: Match[]; upcoming: Match[] }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { live: liveMatches, upcoming: upcomingMatches };
};

export default function Tickets() {
  const [activeTab, setActiveTab] = useState('live');
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [moneyModalMode, setMoneyModalMode] = useState<'deposit' | 'withdraw'>('deposit');
  
  const { toast } = useToast();
  const { wallet, fetchWalletData } = useWallet();
  const balance = wallet?.balance || 0;
  const betSlip = useBetSlip();

  const { data: matchesData, isLoading, refetch } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    refetchInterval: 30000,
  });

  const handleSelectOdds = (odds: Odds) => {
    betSlip.addSelection(odds);
  };

  const handlePlaceBet = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleMoneyAction = async (amount: number, phone: string, provider: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({
      title: moneyModalMode === 'deposit' ? 'Dépôt réussi' : 'Retrait initié',
      description: `${amount.toLocaleString()} FC via ${provider.toUpperCase()}`,
    });
    fetchWalletData();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground">PARIS FOOT</h1>
              <p className="text-xs text-muted-foreground">Ticket Électronique</p>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="ghost" size="icon">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <WalletCard
          balance={balance}
          onDeposit={() => { setMoneyModalMode('deposit'); setMoneyModalOpen(true); }}
          onWithdraw={() => { setMoneyModalMode('withdraw'); setMoneyModalOpen(true); }}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted p-1 rounded-xl">
            <TabsTrigger value="live" className="flex-1 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground rounded-lg">
              <Activity className="w-4 h-4 mr-1.5" />
              En Direct
              {matchesData?.live?.length ? <span className="ml-1.5 text-xs bg-destructive-foreground/20 px-1.5 rounded-full">{matchesData.live.length}</span> : null}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Calendar className="w-4 h-4 mr-1.5" />
              À Venir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-4 space-y-3">
            {isLoading ? [1,2,3].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-xl" />) :
              matchesData?.live?.map(match => <MatchCard key={match.id} match={match} onSelectOdds={handleSelectOdds} isSelected={betSlip.isSelected} />)}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {isLoading ? [1,2,3].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-xl" />) :
              matchesData?.upcoming?.map(match => <MatchCard key={match.id} match={match} onSelectOdds={handleSelectOdds} isSelected={betSlip.isSelected} />)}
          </TabsContent>
        </Tabs>

        <BetSlip
          selections={betSlip.selections}
          stake={betSlip.stake}
          setStake={betSlip.setStake}
          removeSelection={betSlip.removeSelection}
          clearSlip={betSlip.clearSlip}
          totalOdds={betSlip.totalOdds}
          potentialWin={betSlip.potentialWin}
          walletBalance={balance}
          onPlaceBet={handlePlaceBet}
        />
      </div>

      <AnimatePresence>
        {betSlip.count > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-24 left-4 right-4 lg:hidden z-30">
            <div className="bg-primary text-primary-foreground rounded-xl p-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center font-bold">{betSlip.count}</div>
                <div>
                  <p className="text-sm font-semibold">Cote: {betSlip.totalOdds.toFixed(2)}</p>
                  <p className="text-xs opacity-80">Gain: {betSlip.potentialWin.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FC</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileMoneyModal open={moneyModalOpen} onOpenChange={setMoneyModalOpen} mode={moneyModalMode} onConfirm={handleMoneyAction} />
    </div>
  );
}
