import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Ticket, Zap, Crown, Gift, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ElectronicTicket {
  id: string;
  ticket_type: 'electronic' | 'premium' | 'physical';
  is_winner: boolean;
  prize_amount: number;
  status: string;
  revealed_at: string | null;
  created_at: string;
}

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<ElectronicTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealingTicket, setRevealingTicket] = useState<string | null>(null);
  const [revealResult, setRevealResult] = useState<{ isWinner: boolean; amount: number } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('electronic_tickets')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des tickets');
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const revealTicket = async (ticket: ElectronicTicket) => {
    if (ticket.revealed_at) return;

    setRevealingTicket(ticket.id);

    try {
      // Update ticket as revealed
      const { error: updateError } = await supabase
        .from('electronic_tickets')
        .update({
          revealed_at: new Date().toISOString(),
          status: 'used'
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // If winner, credit the prize
      if (ticket.is_winner && ticket.prize_amount > 0) {
        await supabase
          .from('ticket_transactions')
          .insert({
            user_id: user?.id,
            transaction_type: 'win',
            amount: ticket.prize_amount,
            ticket_type: ticket.ticket_type,
            electronic_ticket_id: ticket.id,
            description: `Gain ticket ${ticket.ticket_type} - ${ticket.prize_amount} FC`
          });

        const { data: wallet } = await supabase
          .from('user_wallets')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (wallet) {
          await supabase
            .from('user_wallets')
            .update({ 
              balance: wallet.balance + ticket.prize_amount,
              total_won: wallet.total_won + ticket.prize_amount 
            })
            .eq('user_id', user?.id);
        }
      }

      setRevealResult({
        isWinner: ticket.is_winner,
        amount: ticket.prize_amount
      });
      setShowResultDialog(true);
      fetchTickets();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la révélation');
    } finally {
      setRevealingTicket(null);
    }
  };

  const getTicketIcon = (type: string) => {
    switch (type) {
      case 'premium': return Crown;
      default: return Zap;
    }
  };

  const getTicketColor = (type: string) => {
    switch (type) {
      case 'premium': return 'from-purple-500 to-pink-600';
      default: return 'from-green-500 to-emerald-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Vous devez être connecté pour accéder à cette page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-950">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  const unrevealedTickets = tickets.filter(t => !t.revealed_at);
  const revealedTickets = tickets.filter(t => t.revealed_at);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white p-4"
    >
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-green-400 hover:bg-green-900/40"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-400 mb-2">Mes Tickets</h1>
            <p className="text-gray-400">Révélez vos tickets et découvrez vos gains!</p>
          </div>
          <Button
            onClick={() => navigate('/tickets')}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full shadow-[0_0_25px_rgba(34,197,94,0.5)]"
          >
            Acheter des tickets
          </Button>
        </div>

        {/* Unrevealed Tickets */}
        {unrevealedTickets.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-yellow-400" />
              Tickets à révéler ({unrevealedTickets.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {unrevealedTickets.map((ticket, index) => {
                const IconComponent = getTicketIcon(ticket.ticket_type);
                const gradient = getTicketColor(ticket.ticket_type);

                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="bg-black/40 border border-green-700/20 backdrop-blur-xl hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-all cursor-pointer"
                      onClick={() => revealTicket(ticket)}
                    >
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white capitalize">
                            Ticket {ticket.ticket_type}
                          </CardTitle>
                          <p className="text-sm text-gray-400">
                            Acheté le {format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          À révéler
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold rounded-full`}
                          disabled={revealingTicket === ticket.id}
                        >
                          {revealingTicket === ticket.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Gift className="mr-2 h-4 w-4" />
                              Révéler le ticket
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Revealed Tickets */}
        {revealedTickets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Historique des tickets</h2>
            <div className="space-y-3">
              {revealedTickets.map((ticket) => {
                const IconComponent = getTicketIcon(ticket.ticket_type);

                return (
                  <Card 
                    key={ticket.id}
                    className="bg-black/30 border border-gray-800/30 backdrop-blur-xl"
                  >
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div className="p-2 bg-gray-800/50 rounded-lg">
                        <IconComponent className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 capitalize">
                          Ticket {ticket.ticket_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(ticket.revealed_at!), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      {ticket.is_winner ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Gagné: {ticket.prize_amount} FC
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          Non gagnant
                        </Badge>
                      )}
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {tickets.length === 0 && (
          <Card className="bg-black/40 border border-green-700/20 backdrop-blur-xl p-10 text-center">
            <Ticket className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Aucun ticket</h3>
            <p className="text-gray-400 mb-6">Vous n'avez pas encore de tickets.</p>
            <Button
              onClick={() => navigate('/tickets')}
              className="bg-green-500 hover:bg-green-600 text-black rounded-full"
            >
              Acheter mes premiers tickets
            </Button>
          </Card>
        )}

        {/* Result Dialog */}
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="bg-gray-900 border-green-800/30 text-white text-center">
            <DialogHeader>
              <DialogTitle className="text-3xl">
                {revealResult?.isWinner ? (
                  <span className="text-green-400">🎉 Félicitations!</span>
                ) : (
                  <span className="text-gray-400">Pas de chance!</span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="py-8">
              {revealResult?.isWinner ? (
                <>
                  <Sparkles className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white mb-2">
                    Vous avez gagné {revealResult.amount} FC!
                  </p>
                  <p className="text-gray-400">
                    Le montant a été crédité sur votre compte.
                  </p>
                </>
              ) : (
                <>
                  <Ticket className="h-20 w-20 text-gray-500 mx-auto mb-4" />
                  <p className="text-lg text-gray-300">
                    Ce ticket n'est pas gagnant.
                  </p>
                  <p className="text-gray-400">
                    Tentez votre chance avec un autre ticket!
                  </p>
                </>
              )}
            </div>
            <Button
              onClick={() => setShowResultDialog(false)}
              className="bg-green-500 hover:bg-green-600 text-black"
            >
              Continuer
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default MyTickets;
