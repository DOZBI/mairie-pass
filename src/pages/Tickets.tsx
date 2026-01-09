import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Ticket, Zap, Crown, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface TicketPrice {
  id: string;
  ticket_type: 'physical' | 'electronic' | 'premium';
  price: number;
  premium_multiplier: number;
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
    const { data, error } = await supabase
      .from('ticket_prices')
      .select('*');

    if (error) {
      toast.error('Erreur lors du chargement des prix');
    } else {
      setPrices(data || []);
    }
    setLoading(false);
  };

  const getPrice = (type: string) => {
    return prices.find(p => p.ticket_type === type)?.price || 0;
  };

  const purchaseElectronicTicket = async (ticketType: 'electronic' | 'premium') => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setPurchaseLoading(true);
    const price = getPrice(ticketType);

    try {
      // Determine if this ticket is a winner (10% chance for electronic, 5% for premium but higher prizes)
      const winChance = ticketType === 'electronic' ? 0.1 : 0.05;
      const isWinner = Math.random() < winChance;
      const prizeAmount = isWinner ? (ticketType === 'premium' ? price * 5 : price * 2) : 0;

      // Create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('electronic_tickets')
        .insert({
          user_id: user.id,
          ticket_type: ticketType,
          is_winner: isWinner,
          prize_amount: prizeAmount,
          status: 'sold'
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Record the purchase transaction
      await supabase
        .from('ticket_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'purchase',
          amount: -price,
          ticket_type: ticketType,
          electronic_ticket_id: ticket.id,
          description: `Achat de ticket ${ticketType}`
        });

      // Update wallet
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        await supabase
          .from('user_wallets')
          .update({
            balance: wallet.balance - price,
            total_spent: wallet.total_spent + price
          })
          .eq('user_id', user.id);
      }

      toast.success('Ticket acheté avec succès!');
      navigate('/my-tickets');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'achat');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const redeemPhysicalTicket = async () => {
    if (!user || !physicalCode.trim()) {
      toast.error('Veuillez entrer un code valide');
      return;
    }

    setPurchaseLoading(true);

    try {
      // Check if ticket exists and is available
      const { data: ticket, error } = await supabase
        .from('physical_tickets')
        .select('*')
        .eq('ticket_code', physicalCode.trim().toUpperCase())
        .single();

      if (error || !ticket) {
        toast.error('Code de ticket invalide');
        setPurchaseLoading(false);
        return;
      }

      if (ticket.status !== 'available') {
        toast.error('Ce ticket a déjà été utilisé');
        setPurchaseLoading(false);
        return;
      }

      // Mark ticket as used
      const { error: updateError } = await supabase
        .from('physical_tickets')
        .update({
          status: 'used',
          purchased_by: user.id,
          used_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // If winner, credit the prize
      if (ticket.is_winner && ticket.prize_amount > 0) {
        // Record win transaction
        await supabase
          .from('ticket_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'win',
            amount: ticket.prize_amount,
            ticket_type: 'physical',
            physical_ticket_id: ticket.id,
            description: `Gain ticket physique - ${ticket.prize_amount} FC`
          });

        // Update wallet
        const { data: wallet } = await supabase
          .from('user_wallets')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (wallet) {
          await supabase
            .from('user_wallets')
            .update({
              balance: wallet.balance + ticket.prize_amount,
              total_won: wallet.total_won + ticket.prize_amount
            })
            .eq('user_id', user.id);
        }

        toast.success(`🎉 Félicitations! Vous avez gagné ${ticket.prize_amount} FC!`);
      } else {
        toast.info('Ce ticket n\'est pas gagnant. Tentez votre chance à nouveau!');
      }

      setShowPhysicalDialog(false);
      setPhysicalCode('');
      navigate('/my-tickets');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la validation');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const ticketTypes = [
    {
      type: 'physical' as const,
      title: 'Ticket Physique',
      description: 'Grattez votre ticket et entrez le code unique pour découvrir si vous avez gagné',
      icon: Ticket,
      gradient: 'from-amber-500 to-orange-600',
      action: () => setShowPhysicalDialog(true),
      buttonText: 'Valider mon ticket'
    },
    {
      type: 'electronic' as const,
      title: 'Ticket Électronique',
      description: 'Achetez et jouez instantanément dans l\'application',
      icon: Zap,
      gradient: 'from-green-500 to-emerald-600',
      action: () => purchaseElectronicTicket('electronic'),
      buttonText: 'Acheter'
    },
    {
      type: 'premium' as const,
      title: 'Ticket Premium',
      description: 'Prix élevé, gains potentiels plus importants et valeur évolutive',
      icon: Crown,
      gradient: 'from-purple-500 to-pink-600',
      action: () => purchaseElectronicTicket('premium'),
      buttonText: 'Acheter Premium'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-950">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white p-4"
    >
      <div className="container mx-auto max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-green-400 hover:bg-green-900/40"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-lime-400 bg-clip-text text-transparent">
            <Sparkles className="inline-block mr-3 h-10 w-10" />
            Acheter des Tickets
          </h1>
          <p className="text-gray-400 text-xl">
            Choisissez votre type de ticket et tentez votre chance!
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {ticketTypes.map((ticket, index) => {
            const IconComponent = ticket.icon;
            const price = getPrice(ticket.type);

            return (
              <motion.div
                key={ticket.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-105 border border-green-800/30 bg-black/60 backdrop-blur-md rounded-3xl group h-full flex flex-col">
                  <CardHeader className="text-center pb-3 flex-grow">
                    <div className={`mx-auto mb-4 p-4 bg-gradient-to-br ${ticket.gradient} rounded-2xl w-fit shadow-[0_0_25px_rgba(34,197,94,0.5)] group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-xl text-green-400">{ticket.title}</CardTitle>
                    <CardDescription className="text-gray-400">{ticket.description}</CardDescription>
                    {ticket.type !== 'physical' && (
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-white">{price} FC</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button
                      onClick={ticket.action}
                      disabled={purchaseLoading}
                      className={`w-full bg-gradient-to-r ${ticket.gradient} hover:opacity-90 text-white font-semibold shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300 rounded-full`}
                    >
                      {purchaseLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        ticket.buttonText
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Dialog for physical ticket redemption */}
        <Dialog open={showPhysicalDialog} onOpenChange={setShowPhysicalDialog}>
          <DialogContent className="bg-gray-900 border-green-800/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl text-green-400">Valider un Ticket Physique</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticketCode">Code du ticket</Label>
                <Input
                  id="ticketCode"
                  value={physicalCode}
                  onChange={(e) => setPhysicalCode(e.target.value.toUpperCase())}
                  placeholder="Entrez le code de votre ticket"
                  className="bg-black/50 border-green-800/30 text-white"
                />
              </div>
              <p className="text-sm text-gray-400">
                Grattez votre ticket physique et entrez le code unique qui se trouve dessous.
              </p>
              <Button
                onClick={redeemPhysicalTicket}
                disabled={purchaseLoading || !physicalCode.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90"
              >
                {purchaseLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Valider le ticket'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default Tickets;
