-- Add payment status to request_status enum
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'pending_payment';

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_request_id uuid REFERENCES public.document_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  provider text NOT NULL CHECK (provider IN ('airtel', 'mtn')),
  phone_number text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 5.00,
  currency text NOT NULL DEFAULT 'USD',
  transaction_reference text UNIQUE,
  provider_reference text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add amount field to document_requests if not exists
ALTER TABLE public.document_requests 
ADD COLUMN IF NOT EXISTS amount decimal(10,2) DEFAULT 5.00;

-- Create trigger for payment_transactions updated_at
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(transaction_reference);