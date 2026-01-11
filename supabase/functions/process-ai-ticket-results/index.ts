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

    const { action, ticketId, result } = await req.json();

    if (action === 'set_result') {
      // Admin sets the result of a ticket (won or lost)
      if (!['won', 'lost'].includes(result)) {
        return new Response(
          JSON.stringify({ error: 'Résultat invalide' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get ticket info
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

      if (result === 'won') {
        // Distribute winnings
        const { data: winResult, error: winError } = await supabase
          .rpc('distribute_ai_ticket_wins', { ticket_uuid: ticketId });

        if (winError) throw winError;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Gains distribués !',
            winners_count: winResult?.[0]?.winners_count || 0,
            total_distributed: winResult?.[0]?.total_distributed || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Mark all plays as lost first
        await supabase
          .from('ai_ticket_plays')
          .update({ status: 'lost', updated_at: new Date().toISOString() })
          .eq('ai_ticket_id', ticketId)
          .eq('status', 'active');

        // Update ticket
        await supabase
          .from('ai_football_tickets')
          .update({ 
            status: 'lost', 
            result: 'lost',
            updated_at: new Date().toISOString() 
          })
          .eq('id', ticketId);

        // Check and apply 70% rule
        // First get stats
        const { data: plays } = await supabase
          .from('ai_ticket_plays')
          .select('*')
          .eq('ai_ticket_id', ticketId);

        const totalPlays = plays?.length || 0;
        const identicalPlays = plays?.filter(p => p.is_identical_to_proposal).length || 0;
        const identicalPercentage = totalPlays > 0 ? (identicalPlays / totalPlays) * 100 : 0;

        let refundResult = { refunded_count: 0, total_refunded: 0 };

        if (identicalPercentage >= 70) {
          // Apply 70% refund rule
          const { data, error: refundError } = await supabase
            .rpc('apply_70_percent_refund', { ticket_uuid: ticketId });

          if (!refundError && data) {
            refundResult = data[0] || { refunded_count: 0, total_refunded: 0 };
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: identicalPercentage >= 70 
              ? `Règle 70% appliquée ! ${refundResult.refunded_count} joueurs remboursés`
              : 'Ticket marqué comme perdu',
            identical_percentage: identicalPercentage,
            refund_applied: identicalPercentage >= 70,
            refunded_count: refundResult.refunded_count,
            total_refunded: refundResult.total_refunded
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'simulate_result') {
      // For sandbox: simulate random result
      const isWin = Math.random() > 0.6; // 40% chance of winning
      const result = isWin ? 'won' : 'lost';

      // Recursively call set_result
      const response = await fetch(req.url, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify({ action: 'set_result', ticketId, result })
      });

      return response;
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
