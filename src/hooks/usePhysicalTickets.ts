import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PhysicalTicket {
  id: string;
  ticket_code: string;
  is_winner: boolean;
  prize_amount: number;
  status: string;
  activated_at: string | null;
  used_at: string | null;
  claimed_at: string | null;
}

interface RedeemResult {
  success: boolean;
  ticket?: {
    id: string;
    code: string;
    difficulty: string;
    batchName: string;
    activatedAt: string;
  };
  message: string;
}

interface RevealResult {
  success: boolean;
  isWinner: boolean;
  prizeAmount: number;
  message: string;
}

export function usePhysicalTickets() {
  const { user } = useAuth();
  const [myTickets, setMyTickets] = useState<PhysicalTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [revealing, setRevealing] = useState(false);

  // Fetch user's physical tickets
  const fetchMyTickets = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('physical_tickets')
        .select('*')
        .eq('purchased_by', user.id)
        .order('activated_at', { ascending: false });

      if (error) throw error;
      setMyTickets(data || []);
    } catch (error: any) {
      console.error('Fetch tickets error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Redeem/activate a physical ticket by code
  const redeemTicket = async (ticketCode: string): Promise<RedeemResult | null> => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      return null;
    }

    setRedeeming(true);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-physical-ticket', {
        body: { ticketCode }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(data.message);
      await fetchMyTickets();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'activation du ticket');
      return null;
    } finally {
      setRedeeming(false);
    }
  };

  // Reveal/scratch a ticket to see if it's a winner
  const revealTicket = async (ticketId: string): Promise<RevealResult | null> => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      return null;
    }

    setRevealing(true);
    try {
      const { data, error } = await supabase.functions.invoke('reveal-physical-ticket', {
        body: { ticketId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.isWinner) {
        toast.success(data.message, {
          duration: 5000,
          icon: '🎉'
        });
      } else {
        toast.info(data.message);
      }

      await fetchMyTickets();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du grattage');
      return null;
    } finally {
      setRevealing(false);
    }
  };

  return {
    myTickets,
    loading,
    redeeming,
    revealing,
    fetchMyTickets,
    redeemTicket,
    revealTicket
  };
}
