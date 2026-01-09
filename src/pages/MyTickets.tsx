import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowLeft, Ticket, Crown, Gift, Loader2, Sparkles, Trophy } from 'lucide-react';
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
      toast.error('Erreur de chargement');
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const revealTicket = async (ticket: ElectronicTicket) => {
    if (ticket.revealed_at) return;
    setRevealingTicket(ticket.id);

    try {
      const { error: updateError } = await supabase
        .from('electronic_tickets')
        .update({ revealed_at: new Date().toISOString(), status: 'used' })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      if (ticket.is_winner && ticket.prize_amount > 0) {
        // Logique de crédit simplifiée pour l'exemple
        setRevealResult({ isWinner: true, amount: ticket.prize_amount });
      } else {
        setRevealResult({ isWinner: false, amount: 0 });
      }
      
      setShowResultDialog(true);
      fetchTickets();
    } catch (error: any) {
      toast.error('Erreur lors de la révélation');
    } finally {
      setRevealingTicket(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Loader2 className="h-8 w-8 text-yellow-500" />
      </motion.div>
    </div>
  );

  const unrevealed = tickets.filter(t => !t.revealed_at);
  const revealed = tickets.filter(t => t.revealed_at);

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      {/* Header Minimaliste */}
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Mes Tickets</h1>
        <div className="w-10" /> {/* Spacer */}
      </nav>

      <div className="max-w-md mx-auto p-4 space-y-8">
        
        {/* Section Tickets à gratter */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">À révéler</h2>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-none px-3">
              {unrevealed.length} disponibles
            </Badge>
          </div>

          <AnimatePresence mode="popLayout">
            {unrevealed.length > 0 ? (
              <div className="space-y-4">
                {unrevealed.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => revealTicket(ticket)}
                    className="group relative overflow-hidden bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {/* Motif de fond animé style Loto */}
                    <div className="absolute top-[-20%] right-[-10%] opacity-[0.03] rotate-12 group-hover:rotate-45 transition-transform duration-700">
                      <Ticket size={150} />
                    </div>

                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${ticket.ticket_type === 'premium' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {ticket.ticket_type === 'premium' ? <Crown /> : <Sparkles />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">Loto {ticket.ticket_type}</h3>
                        <p className="text-sm text-gray-400">Appuyez pour gratter</p>
                      </div>
                      {revealingTicket === ticket.id ? (
                        <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                      ) : (
                        <div className="bg-gray-50 p-2 rounded-full">
                          <Gift className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-[28px] border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">Plus de tickets à révéler</p>
                <Button variant="link" onClick={() => navigate('/tickets')} className="text-yellow-600 font-bold">Acheter</Button>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Historique épuré */}
        {revealed.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 px-1">Historique</h2>
            <div className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-gray-100">
              {revealed.map((ticket, idx) => (
                <div key={ticket.id} className={`p-4 flex items-center justify-between ${idx !== revealed.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${ticket.is_winner ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                      {ticket.is_winner ? <Trophy size={18} /> : <Ticket size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Ticket {ticket.ticket_type}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tight">
                        {format(new Date(ticket.revealed_at!), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${ticket.is_winner ? 'text-green-500' : 'text-gray-300'}`}>
                    {ticket.is_winner ? `+${ticket.prize_amount} FC` : 'Perdu'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Pop-up Résultat "Apple Style" */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-[320px] rounded-[32px] border-none p-0 overflow-hidden bg-white/90 backdrop-blur-2xl">
          <div className="p-8 text-center flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: revealResult?.isWinner ? [0, -10, 10, 0] : 0 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${revealResult?.isWinner ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-gray-100 text-gray-400'}`}
            >
              {revealResult?.isWinner ? <Trophy size={48} /> : <Ticket size={48} />}
            </motion.div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {revealResult?.isWinner ? "Gagné !" : "Pas cette fois"}
            </h2>
            <p className="text-gray-500 text-sm mb-8 px-4 leading-relaxed">
              {revealResult?.isWinner 
                ? `Félicitations ! Vous venez de remporter la somme de ${revealResult.amount} FC.` 
                : "Dommage, ce ticket n'était pas le bon. Retentez votre chance !"}
            </p>
            
            <Button 
              onClick={() => setShowResultDialog(false)}
              className="w-full bg-gray-900 text-white hover:bg-black rounded-2xl h-14 font-bold transition-all active:scale-95"
            >
              Continuer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTickets;
