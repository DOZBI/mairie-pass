import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTicketBatches } from '@/hooks/useTicketBatches';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Ticket, Zap, Crown, Sparkles, Loader2, ChevronRight, Info, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Tickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { batches, loading, getPrice, getAvailableBatches, refetch } = useTicketBatches();
  const { wallet, fetchWalletData } = useWallet();
  
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [physicalCode, setPhysicalCode] = useState('');
  const [showPhysicalDialog, setShowPhysicalDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<'electronic' | 'premium' | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment' | 'pending'>('select');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const openPurchaseDialog = (type: 'electronic' | 'premium') => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      return;
    }
    setSelectedType(type);
    const availableBatches = getAvailableBatches(type);
    if (availableBatches.length > 0) {
      setSelectedBatchId(availableBatches[0].id);
    }
    setPaymentStep('select');
    setShowPurchaseDialog(true);
  };

  const getSelectedBatch = () => {
    return batches.find(b => b.id === selectedBatchId);
  };

  const purchaseWithWallet = async () => {
    if (!user || !selectedBatchId) return;
    
    const batch = getSelectedBatch();
    if (!batch) return;

    if ((wallet?.balance || 0) < batch.price) {
      toast.error('Solde insuffisant. Rechargez votre portefeuille.');
      return;
    }

    setPurchaseLoading(true);
    try {
      // Determine if winner based on batch config
      const remainingTickets = batch.total_tickets - batch.sold_tickets;
      const isWinner = Math.random() < (batch.winning_tickets / batch.total_tickets);
      const prizeAmount = isWinner ? batch.price * 2 : 0;

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('electronic_tickets')
        .insert({
          user_id: user.id,
          batch_id: batch.id,
          ticket_type: batch.ticket_type,
          difficulty: batch.difficulty,
          is_winner: isWinner,
          prize_amount: prizeAmount,
          predefined_result: isWinner ? 'win' : 'lose',
          status: 'sold'
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Deduct from wallet
      const newBalance = (wallet?.balance || 0) - batch.price;
      const newSpent = (wallet?.total_spent || 0) + batch.price;
      
      await supabase
        .from('user_wallets')
        .update({ 
          balance: newBalance, 
          total_spent: newSpent,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Record transaction
      await supabase.from('ticket_transactions').insert({
        user_id: user.id,
        transaction_type: 'purchase',
        amount: -batch.price,
        ticket_type: batch.ticket_type,
        electronic_ticket_id: ticket.id,
        description: `Achat ticket ${batch.ticket_type} - ${batch.name}`
      });

      // Update batch sold count
      await supabase
        .from('ticket_batches')
        .update({ 
          sold_tickets: batch.sold_tickets + 1,
          losing_tickets: !isWinner ? batch.losing_tickets + 1 : batch.losing_tickets
        })
        .eq('id', batch.id);

      toast.success('Ticket acheté avec succès !');
      setShowPurchaseDialog(false);
      await fetchWalletData();
      await refetch();
      navigate('/my-tickets');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'achat');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const purchaseWithMTN = async () => {
    if (!user || !selectedBatchId || !phoneNumber) return;

    setPurchaseLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mtn-momo-payment', {
        body: {
          action: 'initiate_ticket_purchase',
          batchId: selectedBatchId,
          ticketType: selectedType,
          phoneNumber
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setPaymentId(data.paymentId);
      setPaymentStep('pending');
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message || 'Erreur de paiement');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!paymentId) return;

    setPurchaseLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mtn-momo-payment', {
        body: {
          action: 'confirm_ticket_purchase',
          paymentId
        }
      });

      if (error) throw error;

      if (data.status === 'completed') {
        toast.success('Ticket acheté avec succès !');
        setShowPurchaseDialog(false);
        await refetch();
        navigate('/my-tickets');
      } else if (data.status === 'failed') {
        toast.error(data.reason || 'Paiement échoué');
        setPaymentStep('payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const redeemPhysicalTicket = async () => {
    if (!user || !physicalCode) return;

    setPurchaseLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-physical-ticket', {
        body: { ticketCode: physicalCode }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(data.message);
      setShowPhysicalDialog(false);
      setPhysicalCode('');
      navigate('/my-tickets');
    } catch (error: any) {
      toast.error(error.message || 'Code invalide');
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
    { type: 'electronic' as const, title: 'Électronique', desc: 'Gain instantané', icon: Zap, gradient: 'from-red-500 to-red-600', action: () => openPurchaseDialog('electronic'), btn: 'Acheter' },
    { type: 'premium' as const, title: 'Premium', desc: 'Jackpot x5', icon: Crown, gradient: 'from-orange-500 to-red-600', action: () => openPurchaseDialog('premium'), btn: 'Acheter Premium' }
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
        {/* Wallet Balance Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 flex items-center justify-between text-white"
        >
          <div>
            <p className="text-xs text-red-100 uppercase tracking-wider">Votre solde</p>
            <p className="text-2xl font-black">{wallet?.balance?.toLocaleString() || 0} FC</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate('/wallet')}
            className="bg-white/20 hover:bg-white/30 text-white border-none"
          >
            Recharger
          </Button>
        </motion.div>

        <header>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 bg-red-100 p-1.5 rounded-lg"><Sparkles size={18} /></span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Tickets</h1>
          </div>
          <p className="text-gray-500 text-sm font-medium">Tentez votre chance maintenant.</p>
        </header>

        {/* Liste des Tickets */}
        <div className="space-y-4">
          {ticketTypes.map((ticket, idx) => {
            const availableBatches = ticket.type === 'electronic' || ticket.type === 'premium' 
              ? getAvailableBatches(ticket.type) 
              : [];
            const hasAvailable = ticket.type === 'physical' || availableBatches.length > 0;
            const minPrice = availableBatches.length > 0 
              ? Math.min(...availableBatches.map(b => b.price))
              : (ticket.type !== 'physical' ? getPrice(ticket.type) : 0);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white rounded-[32px] p-2 border border-red-50 shadow-sm hover:shadow-md transition-all ${!hasAvailable && ticket.type !== 'physical' ? 'opacity-60' : ''}`}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-[22px] bg-gradient-to-br ${ticket.gradient} flex items-center justify-center text-white shadow-lg shadow-red-100`}>
                    <ticket.icon size={30} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{ticket.title}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{ticket.desc}</p>
                    {ticket.type !== 'physical' && availableBatches.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">{availableBatches.length} lot(s) disponible(s)</p>
                    )}
                  </div>
                  {ticket.type !== 'physical' && (
                    <div className="text-right pr-2">
                      <span className="text-2xl font-black text-red-600">{minPrice}</span>
                      <span className="text-[10px] block font-bold text-gray-300 uppercase">FC</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={ticket.action}
                  disabled={purchaseLoading || (!hasAvailable && ticket.type !== 'physical')}
                  className="w-full bg-gray-50 hover:bg-red-600 hover:text-white text-gray-900 font-bold h-14 rounded-[24px] border-none shadow-none transition-all group"
                >
                  {purchaseLoading ? <Loader2 className="animate-spin" /> : <>{ticket.btn} <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" /></>}
                </Button>
              </motion.div>
            );
          })}
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

      {/* Modal Ticket Physique */}
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
              onClick={redeemPhysicalTicket}
              disabled={purchaseLoading || physicalCode.length < 6}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200"
            >
              {purchaseLoading ? <Loader2 className="animate-spin" /> : 'Valider le code'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Achat Ticket Électronique/Premium */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="rounded-[35px] border-none bg-white/95 backdrop-blur-2xl p-8 max-w-[380px]">
          <DialogHeader className="items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              selectedType === 'premium' 
                ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                : 'bg-gradient-to-br from-red-500 to-red-600'
            } text-white`}>
              {selectedType === 'premium' ? <Crown size={32} /> : <Zap size={32} />}
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">
              Ticket {selectedType === 'premium' ? 'Premium' : 'Électronique'}
            </DialogTitle>
          </DialogHeader>

          {paymentStep === 'select' && (
            <div className="space-y-4 mt-4">
              {getAvailableBatches(selectedType || 'electronic').length > 1 && (
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Choisir un lot</label>
                  <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                    <SelectTrigger className="h-14 rounded-2xl">
                      <SelectValue placeholder="Sélectionner un lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBatches(selectedType || 'electronic').map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} - {batch.price} FC ({batch.total_tickets - batch.sold_tickets} restants)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {getSelectedBatch() && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Lot:</span>
                    <span className="font-bold">{getSelectedBatch()?.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Prix:</span>
                    <span className="font-bold text-red-600">{getSelectedBatch()?.price} FC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Disponibles:</span>
                    <span className="font-bold">{(getSelectedBatch()?.total_tickets || 0) - (getSelectedBatch()?.sold_tickets || 0)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={purchaseWithWallet}
                  disabled={purchaseLoading || (wallet?.balance || 0) < (getSelectedBatch()?.price || 0)}
                  className="h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl"
                >
                  {purchaseLoading ? <Loader2 className="animate-spin" /> : 'Portefeuille'}
                </Button>
                <Button
                  onClick={() => setPaymentStep('payment')}
                  variant="outline"
                  className="h-14 rounded-2xl font-bold border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                >
                  <Smartphone className="mr-2" size={18} />
                  MTN MoMo
                </Button>
              </div>

              {(wallet?.balance || 0) < (getSelectedBatch()?.price || 0) && (
                <p className="text-xs text-center text-red-500">
                  Solde insuffisant ({wallet?.balance || 0} FC). <button onClick={() => navigate('/wallet')} className="underline font-bold">Recharger</button>
                </p>
              )}
            </div>
          )}

          {paymentStep === 'payment' && (
            <div className="space-y-4 mt-4">
              <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-yellow-800">
                  <span className="font-bold">MTN Mobile Money</span><br />
                  Montant: {getSelectedBatch()?.price} FC
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Numéro MTN</label>
                <div className="flex gap-2">
                  <div className="h-14 px-4 bg-gray-100 rounded-2xl flex items-center font-bold text-gray-500">
                    +242
                  </div>
                  <Input
                    type="tel"
                    placeholder="06 XXX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 h-14 rounded-2xl bg-gray-50 border-none text-lg font-bold"
                    maxLength={9}
                  />
                </div>
              </div>

              <Button
                onClick={purchaseWithMTN}
                disabled={purchaseLoading || phoneNumber.length < 9}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-2xl"
              >
                {purchaseLoading ? <Loader2 className="animate-spin" /> : 'Payer maintenant'}
              </Button>
            </div>
          )}

          {paymentStep === 'pending' && (
            <div className="space-y-4 mt-4 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto"
              >
                <Smartphone className="text-yellow-600" size={32} />
              </motion.div>

              <p className="text-gray-600">
                Confirmez le paiement sur votre téléphone MTN Mobile Money.
              </p>

              <Button
                onClick={checkPurchaseStatus}
                disabled={purchaseLoading}
                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl"
              >
                {purchaseLoading ? <Loader2 className="animate-spin" /> : 'Vérifier le paiement'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
