import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Wallet as WalletIcon, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WalletData {
  balance: number;
  total_won: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  ticket_type: string;
  description: string;
  created_at: string;
}

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      // Fetch or create wallet
      let { data: walletData, error: walletError } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({ user_id: user?.id, balance: 0 })
          .select()
          .single();

        if (createError) throw createError;
        walletData = newWallet;
      } else if (walletError) {
        throw walletError;
      }

      setWallet(walletData);

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('ticket_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement du portefeuille');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'win': return TrendingUp;
      case 'purchase': return TrendingDown;
      default: return WalletIcon;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'win': return 'text-green-400';
      case 'purchase': return 'text-red-400';
      case 'refund': return 'text-blue-400';
      default: return 'text-gray-400';
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

        <h1 className="text-4xl font-bold text-green-400 mb-8">Mon Portefeuille</h1>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 backdrop-blur-xl mb-8">
          <CardHeader>
            <CardTitle className="text-gray-400 text-sm">Solde disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-6">
              {wallet?.balance.toFixed(2) || '0.00'} FC
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm">Total gagné</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {wallet?.total_won.toFixed(2) || '0.00'} FC
                </p>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-sm">Total dépensé</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {wallet?.total_spent.toFixed(2) || '0.00'} FC
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <h2 className="text-2xl font-bold text-white mb-4">Historique des transactions</h2>

        {transactions.length === 0 ? (
          <Card className="bg-black/40 border border-green-700/20 backdrop-blur-xl p-8 text-center">
            <WalletIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucune transaction pour le moment</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => {
              const IconComponent = getTransactionIcon(tx.transaction_type);
              const colorClass = getTransactionColor(tx.transaction_type);

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-black/30 border border-gray-800/30 backdrop-blur-xl">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className={`p-2 rounded-lg bg-black/50 ${colorClass}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{tx.description}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(tx.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} FC
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Wallet;
