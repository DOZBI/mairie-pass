import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ticketId } = await req.json();

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non autorisé');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Non autorisé');
    }

    // Get the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('physical_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('purchased_by', user.id)
      .single();

    if (ticketError || !ticket) {
      throw new Error('Ticket non trouvé');
    }

    if (ticket.status === 'used') {
      throw new Error('Ce ticket a déjà été gratté');
    }

    // Mark ticket as used
    const now = new Date().toISOString();
    
    const { error: updateError } = await supabase
      .from('physical_tickets')
      .update({
        used_at: now,
        status: 'used'
      })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    // If winner, credit the wallet
    if (ticket.is_winner && ticket.prize_amount > 0) {
      // Get current wallet balance
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('balance, total_won')
        .eq('user_id', user.id)
        .single();

      const newBalance = (wallet?.balance || 0) + ticket.prize_amount;
      const newTotalWon = (wallet?.total_won || 0) + ticket.prize_amount;

      // Update wallet
      await supabase
        .from('user_wallets')
        .upsert({
          user_id: user.id,
          balance: newBalance,
          total_won: newTotalWon,
          updated_at: now
        }, { onConflict: 'user_id' });

      // Record win transaction
      await supabase
        .from('ticket_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'win',
          amount: ticket.prize_amount,
          ticket_type: 'physical',
          physical_ticket_id: ticketId,
          description: `Gain ticket physique: +${ticket.prize_amount} FC`
        });

      // Mark as claimed
      await supabase
        .from('physical_tickets')
        .update({ claimed_at: now })
        .eq('id', ticketId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        isWinner: ticket.is_winner,
        prizeAmount: ticket.prize_amount || 0,
        result: ticket.predefined_result,
        message: ticket.is_winner 
          ? `Félicitations ! Vous avez gagné ${ticket.prize_amount} FC !`
          : 'Pas de chance cette fois. Retentez votre chance !'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Reveal ticket error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors de la révélation' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
