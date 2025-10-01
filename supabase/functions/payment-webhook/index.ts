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

    const body = await req.json();
    console.log('Webhook received:', body);

    const { transactionReference, status, providerReference, provider } = body;

    if (!transactionReference) {
      throw new Error('Transaction reference manquante');
    }

    // Find the transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*, document_requests(*)')
      .eq('transaction_reference', transactionReference)
      .single();

    if (fetchError || !transaction) {
      console.error('Transaction not found:', transactionReference);
      throw new Error('Transaction introuvable');
    }

    console.log('Found transaction:', transaction.id);

    // Update transaction status
    const transactionStatus = status === 'success' ? 'completed' : 'failed';
    const { error: updateTxError } = await supabase
      .from('payment_transactions')
      .update({
        status: transactionStatus,
        completed_at: status === 'success' ? new Date().toISOString() : null,
        error_message: status === 'failed' ? body.errorMessage : null
      })
      .eq('id', transaction.id);

    if (updateTxError) {
      console.error('Transaction update error:', updateTxError);
      throw updateTxError;
    }

    // If payment successful, update document request status
    if (status === 'success') {
      console.log('Payment successful, updating document request');
      const { error: updateDocError } = await supabase
        .from('document_requests')
        .update({ status: 'pending' })
        .eq('id', transaction.document_request_id);

      if (updateDocError) {
        console.error('Document request update error:', updateDocError);
        throw updateDocError;
      }

      console.log('Document request updated to pending');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook traité avec succès' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors du traitement du webhook' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
