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

    // Get auth user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Non autorisé');
    }

    const { transactionId } = await req.json();

    if (!transactionId) {
      throw new Error('Transaction ID manquant');
    }

    console.log('Checking payment status for transaction:', transactionId);

    // Get transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !transaction) {
      throw new Error('Transaction introuvable');
    }

    // In production, you would check with the actual provider API here
    // For now, we simulate a successful payment after 5 seconds
    const createdAt = new Date(transaction.created_at);
    const now = new Date();
    const secondsElapsed = (now.getTime() - createdAt.getTime()) / 1000;

    if (transaction.status === 'pending' && secondsElapsed > 5) {
      // Simulate successful payment
      console.log('Simulating successful payment confirmation');
      
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (!updateError) {
        // Update document request status
        await supabase
          .from('document_requests')
          .update({ status: 'pending' })
          .eq('id', transaction.document_request_id);

        return new Response(
          JSON.stringify({
            status: 'completed',
            message: 'Paiement confirmé avec succès'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        status: transaction.status,
        message: transaction.status === 'pending' 
          ? 'En attente de confirmation du paiement' 
          : transaction.status === 'completed'
          ? 'Paiement confirmé'
          : 'Échec du paiement'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Payment status check error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors de la vérification du statut' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
