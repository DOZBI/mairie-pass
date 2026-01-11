import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Prediction {
  match_name: string;
  team_a: string;
  team_b: string;
  prediction: string;
  prediction_label: string;
  odds: number;
}

interface AITicket {
  id: string;
  ticket_name: string;
  ticket_description: string;
  predictions: Prediction[];
  is_combo: boolean;
  total_odds: number;
  estimated_win_multiplier: number;
  base_stake: number;
  status: string;
  result: string;
  total_players: number;
  total_stake: number;
  identical_players?: number;
  identical_percentage?: number;
  expires_at: string;
  created_at: string;
}

interface AITicketPlay {
  id: string;
  ai_ticket_id: string;
  stake_amount: number;
  predicted_selections: Prediction[];
  status: string;
  potential_win: number;
  actual_win: number;
  is_identical_to_proposal: boolean;
  created_at: string;
  ai_football_tickets?: {
    ticket_name: string;
    ticket_description: string;
    predictions: Prediction[];
    total_odds: number;
    status: string;
    result: string;
  };
}

export function useAITickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<AITicket[]>([]);
  const [myPlays, setMyPlays] = useState<AITicketPlay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-tickets', {
        body: { action: 'list' }
      });

      if (error) throw error;
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error fetching AI tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyPlays = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('play-ai-ticket', {
        body: { action: 'my_plays' }
      });

      if (error) throw error;
      if (data.plays) {
        setMyPlays(data.plays);
      }
    } catch (error) {
      console.error('Error fetching my plays:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
    if (user) {
      fetchMyPlays();
    }
  }, [fetchTickets, fetchMyPlays, user]);

  const generateTickets = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-tickets', {
        body: { action: 'generate' }
      });

      if (error) throw error;
      
      await fetchTickets();
      return { success: true, message: data.message };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur génération';
      return { success: false, message };
    } finally {
      setGenerating(false);
    }
  };

  const playTicket = async (ticketId: string, stakeAmount: number, customSelections?: Prediction[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('play-ai-ticket', {
        body: { action: 'play', ticketId, stakeAmount, customSelections }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      await fetchTickets();
      await fetchMyPlays();
      return { success: true, ...data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur participation';
      return { success: false, message };
    }
  };

  return {
    tickets,
    myPlays,
    loading,
    generating,
    fetchTickets,
    fetchMyPlays,
    generateTickets,
    playTicket
  };
}
