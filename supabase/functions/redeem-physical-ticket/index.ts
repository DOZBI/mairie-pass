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

    const { ticketCode } = await req.json();

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

    if (!ticketCode || ticketCode.length < 6) {
      throw new Error('Code ticket invalide');
    }

    // Find the physical ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('physical_tickets')
      .select('*, ticket_batches(*)')
      .eq('ticket_code', ticketCode.toUpperCase())
      .single();

    if (ticketError || !ticket) {
      throw new Error('Code ticket non trouvé');
    }

    // Check ticket status
    if (ticket.status === 'used') {
      throw new Error('Ce ticket a déjà été utilisé');
    }

    if (ticket.status === 'expired') {
      throw new Error('Ce ticket a expiré');
    }

    if (ticket.purchased_by && ticket.purchased_by !== user.id) {
      throw new Error('Ce ticket appartient à un autre utilisateur');
    }

    // Activate the ticket for this user
    const now = new Date().toISOString();
    
    const { error: updateError } = await supabase
      .from('physical_tickets')
      .update({
        purchased_by: user.id,
        activated_at: now,
        status: 'sold'
      })
      .eq('id', ticket.id);

    if (updateError) throw updateError;

    // Record the transaction
    await supabase
      .from('ticket_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'purchase',
        amount: 0, // Physical tickets are pre-paid
        ticket_type: 'physical',
        physical_ticket_id: ticket.id,
        description: `Activation ticket physique: ${ticketCode}`
      });

    // Return ticket info (without revealing if it's a winner yet)
    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          id: ticket.id,
          code: ticket.ticket_code,
          difficulty: ticket.difficulty,
          batchName: ticket.ticket_batches?.name,
          activatedAt: now
        },
        message: 'Ticket activé avec succès ! Vous pouvez maintenant le gratter.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Redeem ticket error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors de l\'activation' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
