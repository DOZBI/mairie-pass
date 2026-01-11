import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ticketId, stakeAmount, customSelections } = await req.json();

    if (action === 'play') {
      // Get the AI ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('ai_football_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (ticketError || !ticket) {
        return new Response(
          JSON.stringify({ error: 'Ticket non trouvé' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (ticket.status !== 'active' && ticket.status !== 'proposed') {
        return new Response(
          JSON.stringify({ error: 'Ce ticket n\'est plus disponible' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user already played this ticket
      const { data: existingPlay } = await supabase
        .from('ai_ticket_plays')
        .select('id')
        .eq('ai_ticket_id', ticketId)
        .eq('user_id', user.id)
        .single();

      if (existingPlay) {
        return new Response(
          JSON.stringify({ error: 'Vous avez déjà joué ce ticket' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError || !wallet || wallet.balance < stakeAmount) {
        return new Response(
          JSON.stringify({ error: 'Solde insuffisant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Determine if selections are identical to proposal
      const selections = customSelections || ticket.predictions;
      const isIdentical = !customSelections || 
        JSON.stringify(selections) === JSON.stringify(ticket.predictions);

      // Calculate potential win
      const potentialWin = stakeAmount * (ticket.estimated_win_multiplier || ticket.total_odds);

      // Deduct from wallet
      const { error: walletUpdateError } = await supabase
        .from('user_wallets')
        .update({
          balance: wallet.balance - stakeAmount,
          total_spent: wallet.total_spent + stakeAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletUpdateError) throw walletUpdateError;

      // Create the play record
      const { data: play, error: playError } = await supabase
        .from('ai_ticket_plays')
        .insert({
          ai_ticket_id: ticketId,
          user_id: user.id,
          stake_amount: stakeAmount,
          predicted_selections: selections,
          is_identical_to_proposal: isIdentical,
          potential_win: potentialWin,
          status: 'active'
        })
        .select()
        .single();

      if (playError) throw playError;

      // Record transaction
      await supabase.from('ticket_transactions').insert({
        user_id: user.id,
        transaction_type: 'purchase',
        amount: -stakeAmount,
        ticket_type: 'electronic',
        description: `Participation Ticket IA: ${ticket.ticket_name}`
      });

      // Update ticket stats
      await supabase
        .from('ai_football_tickets')
        .update({
          total_players: ticket.total_players + 1,
          total_stake: (ticket.total_stake || 0) + stakeAmount,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Participation enregistrée !',
          play: {
            id: play.id,
            stake: stakeAmount,
            potential_win: potentialWin,
            is_identical: isIdentical
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'my_plays') {
      // Get user's plays with ticket info
      const { data: plays, error } = await supabase
        .from('ai_ticket_plays')
        .select(`
          *,
          ai_football_tickets (
            ticket_name,
            ticket_description,
            predictions,
            total_odds,
            status,
            result
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, plays }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
