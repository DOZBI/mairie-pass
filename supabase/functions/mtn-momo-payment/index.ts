import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MTN Mobile Money Congo Brazzaville Sandbox Configuration
const MTN_SANDBOX_CONFIG = {
  baseUrl: 'https://sandbox.momodeveloper.mtn.com',
  subscriptionKey: Deno.env.get('MTN_MOMO_SUBSCRIPTION_KEY') || 'sandbox-key',
  apiUser: Deno.env.get('MTN_MOMO_API_USER') || 'sandbox-user',
  apiKey: Deno.env.get('MTN_MOMO_API_KEY') || 'sandbox-api-key',
  environment: 'sandbox',
  currency: 'XAF', // Franc CFA for Congo Brazzaville
  targetEnvironment: 'sandbox'
};

// Generate UUID v4 for reference
function generateUUID(): string {
  return crypto.randomUUID();
}

// Get OAuth token from MTN
async function getMTNToken(): Promise<string> {
  // In sandbox mode, we simulate the token
  console.log('Getting MTN MoMo token (sandbox mode)');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return simulated token for sandbox
  return 'sandbox-oauth-token-' + Date.now();
}

// Initiate payment request to MTN MoMo
async function initiatePaymentRequest(
  amount: number,
  phoneNumber: string,
  externalId: string,
  payerMessage: string
): Promise<{ success: boolean; referenceId: string; message: string }> {
  const referenceId = generateUUID();
  
  console.log('Initiating MTN MoMo payment request:', {
    referenceId,
    amount,
    phoneNumber: phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
    currency: MTN_SANDBOX_CONFIG.currency
  });

  // In sandbox mode, simulate the API response
  // In production, you would make actual API calls to MTN
  
  /*
  Production API call would look like:
  
  const token = await getMTNToken();
  
  const response = await fetch(`${MTN_SANDBOX_CONFIG.baseUrl}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': MTN_SANDBOX_CONFIG.targetEnvironment,
      'Ocp-Apim-Subscription-Key': MTN_SANDBOX_CONFIG.subscriptionKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: MTN_SANDBOX_CONFIG.currency,
      externalId: externalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber
      },
      payerMessage: payerMessage,
      payeeNote: 'Recharge portefeuille LotoCongo'
    })
  });
  */

  // Sandbox simulation: Always succeed after brief delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    referenceId,
    message: 'Demande de paiement envoyée. Veuillez confirmer sur votre téléphone.'
  };
}

// Check payment status
async function checkPaymentStatus(referenceId: string): Promise<{
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason?: string;
}> {
  console.log('Checking payment status for:', referenceId);

  /*
  Production API call:
  
  const token = await getMTNToken();
  
  const response = await fetch(
    `${MTN_SANDBOX_CONFIG.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': MTN_SANDBOX_CONFIG.targetEnvironment,
        'Ocp-Apim-Subscription-Key': MTN_SANDBOX_CONFIG.subscriptionKey
      }
    }
  );
  
  const data = await response.json();
  return { status: data.status, reason: data.reason };
  */

  // Sandbox simulation: 80% success rate for testing
  const random = Math.random();
  if (random < 0.8) {
    return { status: 'SUCCESSFUL' };
  } else if (random < 0.95) {
    return { status: 'PENDING' };
  } else {
    return { status: 'FAILED', reason: 'PAYER_CANCELLED' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

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

    console.log('MTN MoMo action:', action, 'User:', user.id);

    switch (action) {
      case 'initiate_recharge': {
        const { amount, phoneNumber } = params;

        if (!amount || amount < 100) {
          throw new Error('Montant minimum: 100 FC');
        }

        if (!phoneNumber || phoneNumber.length < 9) {
          throw new Error('Numéro de téléphone invalide');
        }

        // Format phone number for Congo Brazzaville (242 prefix)
        let formattedPhone = phoneNumber.replace(/\s/g, '').replace(/^0/, '');
        if (!formattedPhone.startsWith('242')) {
          formattedPhone = '242' + formattedPhone;
        }

        const externalId = `RECHARGE-${user.id.substring(0, 8)}-${Date.now()}`;

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            amount: amount,
            provider: 'mtn',
            payment_type: 'wallet_recharge',
            phone_number: formattedPhone,
            status: 'pending',
            metadata: { external_id: externalId, environment: 'sandbox' }
          })
          .select()
          .single();

        if (paymentError) {
          console.error('Payment record error:', paymentError);
          throw new Error('Erreur lors de la création du paiement');
        }

        // Initiate MTN MoMo request
        const result = await initiatePaymentRequest(
          amount,
          formattedPhone,
          externalId,
          `Recharge portefeuille: ${amount} FC`
        );

        // Update payment with provider reference
        await supabase
          .from('payments')
          .update({ provider_reference: result.referenceId })
          .eq('id', payment.id);

        return new Response(
          JSON.stringify({
            success: true,
            paymentId: payment.id,
            referenceId: result.referenceId,
            message: result.message,
            environment: 'sandbox'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_status': {
        const { paymentId } = params;

        const { data: payment, error: fetchError } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !payment) {
          throw new Error('Paiement non trouvé');
        }

        if (payment.status === 'completed') {
          return new Response(
            JSON.stringify({ status: 'completed', amount: payment.amount }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check with MTN
        const statusResult = await checkPaymentStatus(payment.provider_reference);

        if (statusResult.status === 'SUCCESSFUL') {
          // Update payment status
          await supabase
            .from('payments')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', paymentId);

          // Credit user wallet
          const { data: wallet } = await supabase
            .from('user_wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

          const newBalance = (wallet?.balance || 0) + payment.amount;

          await supabase
            .from('user_wallets')
            .upsert({
              user_id: user.id,
              balance: newBalance,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          // Record transaction
          await supabase
            .from('ticket_transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'purchase',
              amount: payment.amount,
              description: `Recharge MTN MoMo: +${payment.amount} FC`
            });

          return new Response(
            JSON.stringify({ 
              status: 'completed', 
              amount: payment.amount,
              newBalance 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (statusResult.status === 'FAILED') {
          await supabase
            .from('payments')
            .update({ 
              status: 'failed',
              metadata: { ...payment.metadata, failure_reason: statusResult.reason }
            })
            .eq('id', paymentId);

          return new Response(
            JSON.stringify({ 
              status: 'failed', 
              reason: statusResult.reason || 'Paiement refusé' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ status: 'pending' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'initiate_ticket_purchase': {
        const { batchId, ticketType, phoneNumber } = params;

        // Get batch info
        const { data: batch, error: batchError } = await supabase
          .from('ticket_batches')
          .select('*')
          .eq('id', batchId)
          .eq('is_active', true)
          .single();

        if (batchError || !batch) {
          throw new Error('Lot de tickets non disponible');
        }

        if (batch.sold_tickets >= batch.total_tickets) {
          throw new Error('Plus de tickets disponibles dans ce lot');
        }

        // Format phone
        let formattedPhone = phoneNumber.replace(/\s/g, '').replace(/^0/, '');
        if (!formattedPhone.startsWith('242')) {
          formattedPhone = '242' + formattedPhone;
        }

        const externalId = `TICKET-${batch.id.substring(0, 8)}-${Date.now()}`;

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            amount: batch.price,
            provider: 'mtn',
            payment_type: 'ticket_purchase',
            phone_number: formattedPhone,
            ticket_type: ticketType,
            status: 'pending',
            metadata: { 
              external_id: externalId, 
              batch_id: batchId,
              environment: 'sandbox' 
            }
          })
          .select()
          .single();

        if (paymentError) throw paymentError;

        const result = await initiatePaymentRequest(
          batch.price,
          formattedPhone,
          externalId,
          `Achat ticket ${ticketType}: ${batch.price} FC`
        );

        await supabase
          .from('payments')
          .update({ provider_reference: result.referenceId })
          .eq('id', payment.id);

        return new Response(
          JSON.stringify({
            success: true,
            paymentId: payment.id,
            referenceId: result.referenceId,
            message: result.message,
            price: batch.price,
            environment: 'sandbox'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'confirm_ticket_purchase': {
        const { paymentId } = params;

        const { data: payment, error: fetchError } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !payment) {
          throw new Error('Paiement non trouvé');
        }

        if (payment.status === 'completed') {
          return new Response(
            JSON.stringify({ status: 'completed', ticketId: payment.ticket_id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const statusResult = await checkPaymentStatus(payment.provider_reference);

        if (statusResult.status === 'SUCCESSFUL') {
          const batchId = payment.metadata?.batch_id;

          // Get batch to determine ticket result
          const { data: batch } = await supabase
            .from('ticket_batches')
            .select('*')
            .eq('id', batchId)
            .single();

          if (!batch) throw new Error('Lot non trouvé');

          // Determine ticket result based on batch configuration
          const remainingTickets = batch.total_tickets - batch.sold_tickets;
          
          const { count: soldWinners } = await supabase
            .from('electronic_tickets')
            .select('id', { count: 'exact', head: true })
            .eq('batch_id', batchId)
            .eq('is_winner', true);

          const remainingWinners = batch.winning_tickets - (soldWinners || 0);
          const isWinner = remainingTickets > 0 && Math.random() < (remainingWinners / remainingTickets);
          const prizeAmount = isWinner ? batch.price * 2 : 0;

          // Create ticket
          const { data: ticket, error: ticketError } = await supabase
            .from('electronic_tickets')
            .insert({
              user_id: user.id,
              batch_id: batchId,
              ticket_type: payment.ticket_type,
              is_winner: isWinner,
              prize_amount: prizeAmount,
              predefined_result: isWinner ? 'win' : 'lose',
              status: 'sold'
            })
            .select()
            .single();

          if (ticketError) throw ticketError;

          // Update payment and batch
          await supabase
            .from('payments')
            .update({ 
              status: 'completed',
              ticket_id: ticket.id,
              completed_at: new Date().toISOString()
            })
            .eq('id', paymentId);

          await supabase
            .from('ticket_batches')
            .update({ 
              sold_tickets: batch.sold_tickets + 1,
              winning_tickets: isWinner ? batch.winning_tickets : batch.winning_tickets,
              losing_tickets: !isWinner ? batch.losing_tickets + 1 : batch.losing_tickets
            })
            .eq('id', batchId);

          // Record transaction
          await supabase
            .from('ticket_transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'purchase',
              amount: -batch.price,
              ticket_type: payment.ticket_type,
              electronic_ticket_id: ticket.id,
              description: `Achat ticket ${payment.ticket_type}`
            });

          return new Response(
            JSON.stringify({ 
              status: 'completed', 
              ticketId: ticket.id 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (statusResult.status === 'FAILED') {
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', paymentId);

          return new Response(
            JSON.stringify({ status: 'failed', reason: statusResult.reason }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ status: 'pending' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Action non reconnue');
    }
  } catch (error: any) {
    console.error('MTN MoMo error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur de paiement' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
