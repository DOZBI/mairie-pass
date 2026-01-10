import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WalletData {
  balance: number;
  total_won: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  ticket_type: string | null;
  description: string | null;
  created_at: string;
}

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);

  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    
    try {
      let { data: walletData, error: walletError } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({ user_id: user.id, balance: 0, total_won: 0, total_spent: 0 })
          .select()
          .single();
        if (createError) throw createError;
        walletData = newWallet;
      } else if (walletError) throw walletError;

      setWallet(walletData);

      const { data: txData, error: txError } = await supabase
        .from('ticket_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error: any) {
      console.error('Wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchWalletData();
  }, [user, fetchWalletData]);

  const initiateRecharge = async (amount: number, phoneNumber: string) => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      return null;
    }

    setRecharging(true);
    try {
      const { data, error } = await supabase.functions.invoke('mtn-momo-payment', {
        body: {
          action: 'initiate_recharge',
          amount,
          phoneNumber
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(data.message);
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'initiation du paiement');
      return null;
    } finally {
      setRecharging(false);
    }
  };

  const checkRechargeStatus = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mtn-momo-payment', {
        body: {
          action: 'check_status',
          paymentId
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.status === 'completed') {
        toast.success(`Recharge réussie ! +${data.amount} FC`);
        await fetchWalletData();
      }

      return data;
    } catch (error: any) {
      console.error('Check status error:', error);
      return { status: 'error', message: error.message };
    }
  };

  return {
    wallet,
    transactions,
    loading,
    recharging,
    fetchWalletData,
    initiateRecharge,
    checkRechargeStatus
  };
}
