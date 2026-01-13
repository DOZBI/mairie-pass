import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  ArrowLeft, 
  Gift, 
  Loader2, 
  Check, 
  X, 
  Sparkles,
  QrCode,
  Trophy,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePhysicalTickets } from '@/hooks/usePhysicalTickets';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PhysicalTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    myTickets, 
    loading, 
    redeeming, 
    revealing, 
    fetchMyTickets, 
    redeemTicket, 
    revealTicket 
  } = usePhysicalTickets();

  const [ticketCode, setTicketCode] = useState('');
  const [scratchingTicketId, setScratchingTicketId] = useState<string | null>(null);
  const [scratchResult, setScratchResult] = useState<{
    isWinner: boolean;
    prizeAmount: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyTickets();
    }
  }, [user, fetchMyTickets]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleRedeemTicket = async () => {
    if (!ticketCode.trim()) return;
    const result = await redeemTicket(ticketCode.trim());
    if (result?.success) {
      setTicketCode('');
    }
  };

  const handleScratchTicket = async (ticketId: string) => {
    setScratchingTicketId(ticketId);
    setScratchResult(null);
    
    const result = await revealTicket(ticketId);
    if (result) {
      setScratchResult({
        isWinner: result.isWinner,
        prizeAmount: result.prizeAmount
      });
      
      // Reset after animation
      setTimeout(() => {
        setScratchingTicketId(null);
        setScratchResult(null);
      }, 5000);
    } else {
      setScratchingTicketId(null);
    }
  };

  const pendingTickets = myTickets.filter(t => t.status === 'sold');
  const usedTickets = myTickets.filter(t => t.status === 'used');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-amber-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-amber-900 dark:text-amber-100">TICKETS À GRATTER</h1>
              <p className="text-xs text-amber-600 dark:text-amber-400">Tickets Physiques</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Code Entry Card */}
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-950 shadow-xl shadow-amber-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <QrCode className="w-5 h-5 text-amber-500" />
              Activer un Ticket
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Saisissez le code de votre ticket physique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Ex: TKT-ABC123XYZ"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-widest uppercase border-amber-300 dark:border-amber-700 focus:border-amber-500"
              maxLength={30}
            />
            <Button
              onClick={handleRedeemTicket}
              disabled={redeeming || !ticketCode.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/30"
            >
              {redeeming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Activer le Ticket
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Pending Tickets */}
        {pendingTickets.length > 0 && (
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-900 dark:text-amber-100">
              <Gift className="w-5 h-5 text-amber-500" />
              Tickets à Gratter ({pendingTickets.length})
            </h2>
            <div className="grid gap-3">
              <AnimatePresence>
                {pendingTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                  >
                    <Card className="overflow-hidden border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono font-bold text-amber-900 dark:text-amber-100">
                              {ticket.ticket_code}
                            </p>
                            {ticket.activated_at && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                Activé le {format(new Date(ticket.activated_at), 'dd/MM/yyyy', { locale: fr })}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleScratchTicket(ticket.id)}
                            disabled={revealing || scratchingTicketId !== null}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                          >
                            {scratchingTicketId === ticket.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-1" />
                                Gratter
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Result Animation */}
                        <AnimatePresence>
                          {scratchingTicketId === ticket.id && scratchResult && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4"
                            >
                              {scratchResult.isWinner ? (
                                <motion.div
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-4 text-center text-white"
                                >
                                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                                  <p className="text-2xl font-black">GAGNANT !</p>
                                  <p className="text-3xl font-bold mt-1">
                                    {scratchResult.prizeAmount.toLocaleString()} FC
                                  </p>
                                  <p className="text-sm opacity-90 mt-1">
                                    Crédité sur votre portefeuille
                                  </p>
                                </motion.div>
                              ) : (
                                <motion.div
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl p-4 text-center text-white"
                                >
                                  <X className="w-12 h-12 mx-auto mb-2" />
                                  <p className="text-xl font-bold">Pas de chance</p>
                                  <p className="text-sm opacity-90 mt-1">
                                    Retentez votre chance !
                                  </p>
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Used Tickets History */}
        {usedTickets.length > 0 && (
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-600 dark:text-gray-400">
              <Clock className="w-5 h-5" />
              Historique ({usedTickets.length})
            </h2>
            <div className="space-y-2">
              {usedTickets.slice(0, 10).map((ticket) => (
                <Card key={ticket.id} className="bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {ticket.ticket_code}
                      </p>
                      {ticket.used_at && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(ticket.used_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={ticket.is_winner ? "default" : "secondary"}
                      className={ticket.is_winner 
                        ? "bg-green-500/20 text-green-600 border-green-500/30" 
                        : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }
                    >
                      {ticket.is_winner ? `+${ticket.prize_amount?.toLocaleString()} FC` : 'Perdant'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && myTickets.length === 0 && (
          <Card className="border-dashed border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30">
            <CardContent className="p-8 text-center">
              <Ticket className="w-16 h-16 mx-auto text-amber-300 dark:text-amber-700 mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Aucun ticket activé
              </h3>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Achetez un ticket physique et saisissez son code pour commencer à jouer !
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
