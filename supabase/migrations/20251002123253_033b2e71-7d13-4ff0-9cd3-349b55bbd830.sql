-- Add foreign key relationship between payment_transactions and profiles
ALTER TABLE public.payment_transactions
ADD CONSTRAINT payment_transactions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;