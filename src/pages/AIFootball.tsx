import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAITickets } from '@/hooks/useAITickets';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Brain, Zap, Users, TrendingUp, Loader2, 
  ChevronRight, Trophy, RefreshCw, Clock, Target, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const AIFootball = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tickets, myPlays, loading, generating, generateTickets, playTicket, fetchTickets } = useAITickets();
  const { wallet, fetchWalletData } = useWallet();
  
  const [showPlayDialog, setShowPlayDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [playing, setPlaying] = useState(false);

  const handleGenerate = async () => {
    const result = await generateTickets();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const openPlayDialog = (ticket: any) => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      navigate('/auth');
      return;
    }
    setSelectedTicket(ticket);
    setStakeAmount(ticket.base_stake || 100);
    setShowPlayDialog(true);
  };

  const handlePlay = async () => {
    if (!selectedTicket || stakeAmount < 100) return;
    
    if ((wallet?.balance || 0) < stakeAmount) {
      toast.error('Solde insuffisant');
      return;
    }

    setPlaying(true);
    const result = await playTicket(selectedTicket.id, stakeAmount);
    setPlaying(false);

    if (result.success) {
      toast.success(`Participation enregistrée ! Gain potentiel: ${result.play?.potential_win?.toLocaleString()} FC`);
      setShowPlayDialog(false);
      await fetchWalletData();
    } else {
      toast.error(result.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'proposed': return 'bg-blue-100 text-blue-700';
      case 'won': return 'bg-yellow-100 text-yellow-700';
      case 'lost': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const hasPlayed = (ticketId: string) => {
    return myPlays.some(p => p.ai_ticket_id === ticketId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-32">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-indigo-100">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-indigo-50 rounded-full transition-colors text-indigo-600">
          <ArrowLeft size={24} />
        </button>
        <span className="flex-1 text-center font-bold text-gray-900 mr-8">Paris IA Football</span>
      </nav>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-6 w-6" />
              <span className="text-xs uppercase tracking-wider opacity-80">Propulsé par IA</span>
            </div>
            <h1 className="text-2xl font-black mb-2">Tickets Football IA</h1>
            <p className="text-sm opacity-90 mb-4">
              L'IA analyse les matchs et propose des pronostics. Jouez collectif pour activer le remboursement à 70% !
            </p>
            
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Protection 70%</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Jeu collectif</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallet + Generate */}
        <div className="flex gap-3">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider">Votre solde</p>
            <p className="text-2xl font-black text-gray-900">{wallet?.balance?.toLocaleString() || 0} FC</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl px-6"
            >
              {generating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Générer
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Rule Explanation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100"
        >
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-xl">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-800 text-sm">Règle de protection 70%</h3>
              <p className="text-xs text-green-600 mt-1">
                Si 70% des joueurs font exactement le même pronostic et perdent, tout le monde est remboursé à 100% !
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-500" />
            Tickets disponibles
          </h2>

          {tickets.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-8 text-center border border-gray-100"
            >
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun ticket disponible</p>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="animate-spin mr-2" /> : <Brain className="mr-2" />}
                Générer des tickets
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {tickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-gray-900">{ticket.ticket_name}</h3>
                        {ticket.is_combo && (
                          <Badge variant="secondary" className="text-xs">COMBO</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{ticket.ticket_description}</p>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status === 'active' ? 'Actif' : ticket.status}
                    </Badge>
                  </div>

                  {/* Predictions */}
                  <div className="space-y-2 mb-4">
                    {ticket.predictions?.map((pred: any, pIdx: number) => (
                      <div key={pIdx} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">{pred.match_name}</p>
                            <p className="font-semibold text-sm text-gray-900">{pred.prediction_label}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-indigo-600">{pred.odds}x</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-indigo-50 rounded-xl p-3 text-center">
                      <TrendingUp className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-indigo-600">{ticket.total_odds}x</p>
                      <p className="text-[10px] text-indigo-400 uppercase">Cote totale</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <Users className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-purple-600">{ticket.total_players || 0}</p>
                      <p className="text-[10px] text-purple-400 uppercase">Joueurs</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <Target className="h-4 w-4 text-green-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-600">{ticket.identical_percentage || 0}%</p>
                      <p className="text-[10px] text-green-400 uppercase">Identiques</p>
                    </div>
                  </div>

                  {/* Progress bar for 70% rule */}
                  {ticket.total_players > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progression vers 70%</span>
                        <span className={ticket.identical_percentage >= 70 ? 'text-green-600 font-bold' : 'text-gray-400'}>
                          {ticket.identical_percentage >= 70 ? '✓ Remboursement activé' : `${ticket.identical_percentage}%`}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(ticket.identical_percentage || 0, 100)} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => openPlayDialog(ticket)}
                    disabled={hasPlayed(ticket.id) || ticket.status !== 'active'}
                    className={`w-full h-14 rounded-2xl font-bold ${
                      hasPlayed(ticket.id) 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                    }`}
                  >
                    {hasPlayed(ticket.id) ? (
                      <>Déjà joué</>
                    ) : (
                      <>
                        Jouer ce ticket
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* My Plays Section */}
        {myPlays.length > 0 && (
          <div className="space-y-4 mt-8">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Mes participations
            </h2>

            {myPlays.map((play) => (
              <motion.div
                key={play.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{play.ai_football_tickets?.ticket_name}</h4>
                  <Badge className={getStatusColor(play.status)}>
                    {play.status === 'active' ? 'En cours' : 
                     play.status === 'won' ? 'Gagné' :
                     play.status === 'lost' ? 'Perdu' :
                     play.status === 'refunded' ? 'Remboursé' : play.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Mise</p>
                    <p className="font-bold text-gray-900">{play.stake_amount} FC</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Gain potentiel</p>
                    <p className="font-bold text-indigo-600">{play.potential_win?.toLocaleString()} FC</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Identique IA</p>
                    <p className={`font-bold ${play.is_identical_to_proposal ? 'text-green-600' : 'text-gray-400'}`}>
                      {play.is_identical_to_proposal ? 'Oui ✓' : 'Non'}
                    </p>
                  </div>
                </div>

                {play.status === 'won' && (
                  <div className="mt-3 bg-yellow-50 rounded-xl p-3 text-center">
                    <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                    <p className="font-bold text-yellow-700">Vous avez gagné {play.actual_win?.toLocaleString()} FC !</p>
                  </div>
                )}

                {play.status === 'refunded' && (
                  <div className="mt-3 bg-purple-50 rounded-xl p-3 text-center">
                    <RefreshCw className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                    <p className="font-bold text-purple-700">Remboursé (règle 70%) : {play.stake_amount} FC</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Play Dialog */}
      <Dialog open={showPlayDialog} onOpenChange={setShowPlayDialog}>
        <DialogContent className="rounded-[35px] border-none bg-white/95 backdrop-blur-2xl p-8 max-w-[380px]">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">
              Jouer ce ticket
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-900 mb-2">{selectedTicket.ticket_name}</h4>
                <div className="space-y-2">
                  {selectedTicket.predictions?.map((pred: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-500">{pred.match_name}</span>
                      <span className="font-semibold">{pred.prediction_label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-500">Cote totale</span>
                  <span className="font-black text-indigo-600">{selectedTicket.total_odds}x</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Votre mise (FC)</label>
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Math.max(100, parseInt(e.target.value) || 0))}
                  min={100}
                  step={100}
                  className="h-14 rounded-2xl text-center text-xl font-bold"
                />
                <p className="text-xs text-gray-400 mt-1 text-center">Minimum: 100 FC</p>
              </div>

              <div className="bg-indigo-50 rounded-2xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-indigo-600">Gain potentiel</span>
                  <span className="font-black text-indigo-700">
                    {(stakeAmount * (selectedTicket.estimated_win_multiplier || selectedTicket.total_odds)).toLocaleString()} FC
                  </span>
                </div>
                <p className="text-xs text-indigo-400">
                  Votre mise × {selectedTicket.total_odds}
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700">
                    En jouant le pronostic IA exact, vous bénéficiez de la protection 70%
                  </p>
                </div>
              </div>

              <Button
                onClick={handlePlay}
                disabled={playing || (wallet?.balance || 0) < stakeAmount}
                className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-2xl"
              >
                {playing ? (
                  <Loader2 className="animate-spin" />
                ) : (wallet?.balance || 0) < stakeAmount ? (
                  'Solde insuffisant'
                ) : (
                  `Confirmer - ${stakeAmount} FC`
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIFootball;
