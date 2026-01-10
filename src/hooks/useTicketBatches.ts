import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TicketBatch {
  id: string;
  name: string;
  ticket_type: 'physical' | 'electronic' | 'premium';
  difficulty: 'easy' | 'medium' | 'hard';
  price: number;
  total_tickets: number;
  sold_tickets: number;
  winning_tickets: number;
  losing_tickets: number;
  is_active: boolean;
  match_id: string | null;
  matches?: {
    name: string;
    team_a: string | null;
    team_b: string | null;
    match_date: string | null;
  } | null;
}

interface TicketPrice {
  id: string;
  ticket_type: 'physical' | 'electronic' | 'premium';
  price: number;
}

export function useTicketBatches() {
  const [batches, setBatches] = useState<TicketBatch[]>([]);
  const [prices, setPrices] = useState<TicketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch active batches with available tickets
      const { data: batchData, error: batchError } = await supabase
        .from('ticket_batches')
        .select(`
          *,
          matches (
            name,
            team_a,
            team_b,
            match_date
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (batchError) throw batchError;

      // Filter batches with available tickets
      const availableBatches = (batchData || []).filter(
        batch => batch.sold_tickets < batch.total_tickets
      );

      setBatches(availableBatches);

      // Fetch prices
      const { data: priceData, error: priceError } = await supabase
        .from('ticket_prices')
        .select('*');

      if (priceError) throw priceError;
      setPrices(priceData || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPrice = (type: string): number => {
    return prices.find(p => p.ticket_type === type)?.price || 0;
  };

  const getAvailableBatches = (type: 'physical' | 'electronic' | 'premium') => {
    return batches.filter(b => b.ticket_type === type);
  };

  const getBatchById = (id: string) => {
    return batches.find(b => b.id === id);
  };

  return {
    batches,
    prices,
    loading,
    getPrice,
    getAvailableBatches,
    getBatchById,
    refetch: fetchData
  };
}
