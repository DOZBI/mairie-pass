import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Ticket, Zap, Crown, Sparkles, Loader2, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketPrice {
  id: string;
  ticket_type: 'physical' | 'electronic' | 'premium';
  price: number;
}

const Tickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prices, setPrices] = useState<TicketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [physicalCode, setPhysicalCode] = useState('');
  const [showPhysicalDialog, setShowPhysicalDialog] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    const { data, error } = await supabase.from('ticket_prices').select('*');
    if (error) toast.error('Erreur de chargement');
    else setPrices(data || []);
    setLoading(false);
  };

  const getPrice = (type: string) => prices.find(p => p.ticket_type === type)?.price || 0;

  const purchaseElectronicTicket = async (ticketType: 'electronic' | 'premium') => {
    if (!user) { toast.error('Connectez-vous'); return; }
    setPurchaseLoading(true);
    const price = getPrice(ticketType);

    try {
      const winChance = ticketType === 'electronic' ? 0.1 : 0.05;
      const isWinner = Math.random() < winChance;
      const prizeAmount = isWinner ? (ticketType === 'premium' ? price * 5 : price * 2) : 0;

      const { data: ticket, error: ticketError } = await supabase
        .from('electronic_tickets')
        .insert({ user_id: user.id, ticket_type: ticketType, is_winner: isWinner, prize_amount: prizeAmount, status: 'sold' })
        .select().single();

      if (ticketError) throw ticketError;

      await supabase.from('ticket_transactions').insert({
        user_id: user.id, transaction_type: 'purchase', amount: -price, ticket_type: ticketType, 
        electronic_ticket_id: ticket.id, description: `Achat ticket ${ticketType}`
      });

      toast.success('Ticket acheté !');
      navigate('/my-tickets');
    } catch (error: any) {
      toast.error('Erreur lors de l\'achat');
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF2F2]">
      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
    </div>
  );

  const ticketTypes = [
    { type: 'physical' as const, title: 'Physique', desc: 'Code de grattage', icon: Ticket, gradient: 'from-gray-900 to-gray-800', action: () => setShowPhysicalDialog(true), btn: 'Valider un code' },
    { type: 'electronic' as const, title: 'Électronique', desc: 'Gain instantané', icon: Zap, gradient: 'from-red-500 to-red-600', action: () => purchaseElectronicTicket('electronic'), btn: 'Acheter' },
    { type: 'premium' as const, title: 'Premium', desc: 'Jackpot x5', icon: Crown, gradient: 'from-orange-500 to-red-600', action: () => purchaseElectronicTicket('premium'), btn: 'Acheter Premium' }
  ];

  return (
    <div className="min-h-screen bg-[#FDF2F2] pb-32">
      {/* Navigation Apple Style */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-red-50">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-600">
          <ArrowLeft size={24} />
        </button>
        <span className="flex-1 text-center font-bold text-gray-900 mr-8">Boutique</span>
      </nav>

      <div className="max-w-md mx-auto p-6 space-y-8">
        <header>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 bg-red-100 p-1.5 rounded-lg"><Sparkles size={18} /></span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Tickets</h1>
          </div>
          <p className="text-gray-500 text-sm font-medium">Tentez votre chance maintenant.</p>
        </header>

        {/* Liste des Tickets */}
        <div className="space-y-4">
          {ticketTypes.map((ticket, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[32px] p-2 border border-red-50 shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-4 flex items-center gap-4">
                <div className={`w-16 h-16 rounded-[22px] bg-gradient-to-br ${ticket.gradient} flex items-center justify-center text-white shadow-lg shadow-red-100`}>
                  <ticket.icon size={30} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 text-lg leading-tight">{ticket.title}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{ticket.desc}</p>
                </div>
                {ticket.type !== 'physical' && (
                  <div className="text-right pr-2">
                    <span className="text-2xl font-black text-red-600">{getPrice(ticket.type)}</span>
                    <span className="text-[10px] block font-bold text-gray-300 uppercase">FC</span>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={ticket.action}
                disabled={purchaseLoading}
                className="w-full bg-gray-50 hover:bg-red-600 hover:text-white text-gray-900 font-bold h-14 rounded-[24px] border-none shadow-none transition-all group"
              >
                {purchaseLoading ? <Loader2 className="animate-spin" /> : <>{ticket.btn} <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Aide Contextuelle Apple Style */}
        <div className="bg-white/50 border border-white rounded-[28px] p-6 flex gap-4 items-start">
          <div className="bg-white p-2 rounded-xl shadow-sm text-red-500"><Info size={20} /></div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-1">Comment ça marche ?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Les tickets électroniques sont crédités immédiatement. Pour les physiques, utilisez le code présent sous la zone à gratter.</p>
          </div>
        </div>
      </div>

      {/* Modal Ticket Physique Apple Style */}
      <Dialog open={showPhysicalDialog} onOpenChange={setShowPhysicalDialog}>
        <DialogContent className="rounded-[35px] border-none bg-white/90 backdrop-blur-2xl p-8 max-w-[340px]">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
              <Ticket size={32} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">Code Ticket</DialogTitle>
            <p className="text-sm text-gray-400 font-medium">Saisissez le code de grattage</p>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <Input
              value={physicalCode}
              onChange={(e) => setPhysicalCode(e.target.value.toUpperCase())}
              placeholder="ABC-123-XYZ"
              className="h-16 rounded-2xl bg-gray-50 border-none text-center text-xl font-bold tracking-widest focus:ring-2 focus:ring-red-500"
            />
            <Button
              onClick={() => {/* redeem logic */}}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200"
            >
              Valider le gain
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
