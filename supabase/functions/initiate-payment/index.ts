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

    // Get request body
    const { documentRequestId, provider, phoneNumber, amount = 5.00 } = await req.json();

    // Get auth user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Non autorisé');
    }

    console.log('Initiating payment for user:', user.id, 'Provider:', provider);

    // Generate unique transaction reference
    const transactionReference = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        document_request_id: documentRequestId,
        user_id: user.id,
        provider: provider,
        phone_number: phoneNumber,
        amount: amount,
        currency: 'USD',
        transaction_reference: transactionReference,
        status: 'pending'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      throw transactionError;
    }

    console.log('Payment transaction created:', transaction.id);

    // Simulate payment initiation with provider
    // In production, you would call the actual Airtel/MTN API here
    let paymentResponse;

    if (provider === 'airtel') {
      // Airtel Money API integration would go here
      console.log('Simulating Airtel Money payment initiation');
      paymentResponse = {
        success: true,
        message: 'Paiement Airtel Money initié. Veuillez confirmer sur votre téléphone.',
        providerReference: `AM${transactionReference}`,
        transactionId: transaction.id
      };
    } else if (provider === 'mtn') {
      // MTN Mobile Money API integration would go here
      console.log('Simulating MTN Mobile Money payment initiation');
      paymentResponse = {
        success: true,
        message: 'Paiement MTN Mobile Money initié. Veuillez confirmer sur votre téléphone.',
        providerReference: `MTN${transactionReference}`,
        transactionId: transaction.id
      };
    } else {
      throw new Error('Fournisseur de paiement non supporté');
    }

    // Update transaction with provider reference
    await supabase
      .from('payment_transactions')
      .update({ provider_reference: paymentResponse.providerReference })
      .eq('id', transaction.id);

    return new Response(
      JSON.stringify(paymentResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors de l\'initiation du paiement' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
