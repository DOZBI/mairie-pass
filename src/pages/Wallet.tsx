import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet as WalletIcon, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { RechargeModal } from '@/components/RechargeModal';

const Wallet = () => {
  const navigate = useNavigate();
  const { wallet, transactions, loading, recharging, initiateRecharge, checkRechargeStatus } = useWallet();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF2F2]">
      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF2F2] pb-32 font-sans">
      {/* Header Minimaliste Rouge */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-red-100 px-4 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-red-50 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-red-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Portefeuille</h1>
        <button 
          onClick={() => setShowRechargeModal(true)}
          className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
        >
          <Plus className="h-5 w-5 text-red-600" />
        </button>
      </nav>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Apple Style Balance Card - Thème Rouge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-800 rounded-[32px] p-8 text-white shadow-2xl shadow-red-200"
        >
          <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12">
            <WalletIcon size={200} />
          </div>
          
          <p className="text-red-100 text-sm font-medium mb-1 opacity-80 uppercase tracking-widest">Solde Actuel</p>
          <div className="text-5xl font-black mb-8 tracking-tighter">
            {wallet?.balance.toLocaleString()} <span className="text-2xl font-light opacity-70">FC</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-red-100/80 mb-1">
                <ArrowUpRight className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase">Gagné</span>
              </div>
              <p className="text-lg font-bold">{wallet?.total_won.toLocaleString()} FC</p>
            </div>
            <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-red-100/80 mb-1">
                <ArrowDownRight className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase">Dépensé</span>
              </div>
              <p className="text-lg font-bold">{wallet?.total_spent.toLocaleString()} FC</p>
            </div>
          </div>

          {/* Recharge Button */}
          <Button
            onClick={() => setShowRechargeModal(true)}
            className="w-full mt-6 h-14 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl backdrop-blur-sm border border-white/20"
          >
            <Plus className="mr-2" size={20} />
            Recharger via MTN Mobile Money
          </Button>
        </motion.div>

        {/* Historique des Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Activité Récente</h2>
          </div>

          <div className="bg-white rounded-[30px] shadow-sm border border-red-50 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm italic">
                Aucun mouvement enregistré
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {transactions.map((tx, idx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-5 flex items-center justify-between active:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${
                        tx.transaction_type === 'win' || tx.amount > 0
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-50 text-red-500'
                      }`}>
                        {tx.transaction_type === 'win' || tx.amount > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{tx.description || 'Transaction'}</p>
                        <p className="text-[11px] text-gray-400 font-medium uppercase">
                          {format(new Date(tx.created_at), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-black ${
                        tx.amount > 0 ? 'text-green-500' : 'text-red-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">FCFA</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recharge Modal */}
      <RechargeModal
        open={showRechargeModal}
        onOpenChange={setShowRechargeModal}
        onInitiateRecharge={initiateRecharge}
        onCheckStatus={checkRechargeStatus}
        recharging={recharging}
      />
    </div>
  );
};

export default Wallet;
