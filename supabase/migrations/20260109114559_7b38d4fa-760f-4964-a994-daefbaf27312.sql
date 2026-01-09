
-- =====================================================
-- SYSTÈME DE LOTERIE HYBRIDE - STRUCTURE COMPLÈTE
-- =====================================================

-- 1. SUPPRESSION DES ANCIENS TYPES ET TABLES SI NÉCESSAIRES
-- (On garde les tables existantes compatibles)

-- 2. NOUVEAUX TYPES ENUM
-- =====================================================

-- Type de difficulté des tickets
DO $$ BEGIN
    CREATE TYPE public.ticket_difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Résultat prédéfini du ticket
DO $$ BEGIN
    CREATE TYPE public.ticket_result AS ENUM ('pending', 'win', 'lose', 'bonus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statut de paiement
DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fournisseur de paiement mobile
DO $$ BEGIN
    CREATE TYPE public.payment_provider AS ENUM ('mtn', 'airtel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLE DES MATCHS/ÉVÉNEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    team_a TEXT,
    team_b TEXT,
    match_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished', 'cancelled')),
    result TEXT, -- Score final ou résultat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. TABLE DES LOTS DE TICKETS (BATCHES)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ticket_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ticket_type ticket_type NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0),
    difficulty ticket_difficulty NOT NULL DEFAULT 'medium',
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    total_tickets INTEGER NOT NULL DEFAULT 0,
    sold_tickets INTEGER NOT NULL DEFAULT 0,
    winning_tickets INTEGER NOT NULL DEFAULT 0,
    losing_tickets INTEGER NOT NULL DEFAULT 0,
    refund_threshold NUMERIC DEFAULT 0.70, -- Seuil 70%
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. MODIFICATION DE LA TABLE PHYSICAL_TICKETS
-- =====================================================
ALTER TABLE public.physical_tickets 
ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.ticket_batches(id),
ADD COLUMN IF NOT EXISTS difficulty ticket_difficulty DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS predefined_result ticket_result DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES public.matches(id),
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_transaction_id UUID,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- 6. MODIFICATION DE LA TABLE ELECTRONIC_TICKETS
-- =====================================================
ALTER TABLE public.electronic_tickets
ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.ticket_batches(id),
ADD COLUMN IF NOT EXISTS difficulty ticket_difficulty DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS predefined_result ticket_result DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES public.matches(id),
ADD COLUMN IF NOT EXISTS predicted_outcome TEXT,
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_transaction_id UUID,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- 7. TABLE DES TICKETS PREMIUM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premium_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    batch_id UUID REFERENCES public.ticket_batches(id),
    initial_value NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL,
    growth_index NUMERIC DEFAULT 1.0,
    purchase_price NUMERIC NOT NULL,
    is_redeemable BOOLEAN DEFAULT false,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    status ticket_status DEFAULT 'sold',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. TABLE DES PAIEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    provider payment_provider NOT NULL,
    phone_number TEXT NOT NULL,
    provider_reference TEXT,
    status payment_status DEFAULT 'pending',
    payment_type TEXT NOT NULL CHECK (payment_type IN ('ticket_purchase', 'wallet_topup', 'prize_payout', 'refund')),
    ticket_id UUID, -- Référence au ticket acheté
    ticket_type ticket_type, -- Type de ticket
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. TABLE DES REMBOURSEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    ticket_id UUID NOT NULL,
    ticket_type ticket_type NOT NULL,
    batch_id UUID REFERENCES public.ticket_batches(id),
    amount NUMERIC NOT NULL,
    reason TEXT DEFAULT 'protection_70',
    payment_id UUID REFERENCES public.payments(id),
    provider payment_provider,
    phone_number TEXT,
    status payment_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 10. TABLE DES PROPOSITIONS IA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_ticket_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id),
    proposed_by TEXT DEFAULT 'google_ai',
    ticket_type ticket_type NOT NULL,
    difficulty ticket_difficulty NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    win_count INTEGER NOT NULL,
    lose_count INTEGER NOT NULL,
    bonus_count INTEGER DEFAULT 0,
    total_prize_pool NUMERIC,
    proposal_data JSONB, -- Détails de la proposition
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. TABLE DES PARAMÈTRES ADMIN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer les paramètres par défaut
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES 
    ('refund_threshold', '{"value": 0.70}', 'Seuil de remboursement (70%)'),
    ('ticket_prices', '{"physical": [200, 500, 600, 1000, 2000], "electronic": [200, 500, 600, 1000, 2000], "premium": [5000, 10000, 20000]}', 'Prix des tickets par type'),
    ('max_gain_multiplier', '{"easy": 2, "medium": 5, "hard": 10}', 'Multiplicateur max par difficulté'),
    ('premium_growth_factors', '{"revenue": 0.3, "users": 0.4, "sales": 0.3}', 'Facteurs de croissance premium')
ON CONFLICT (setting_key) DO NOTHING;

-- 12. TABLE D'AUDIT/LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- ACTIVATION RLS ET POLITIQUES
-- =====================================================

-- Matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches"
ON public.matches FOR SELECT
USING (true);

CREATE POLICY "Admins can manage matches"
ON public.matches FOR ALL
USING (is_admin(auth.uid()));

-- Ticket Batches
ALTER TABLE public.ticket_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ticket batches"
ON public.ticket_batches FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active batches"
ON public.ticket_batches FOR SELECT
USING (is_active = true);

-- Premium Tickets
ALTER TABLE public.premium_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own premium tickets"
ON public.premium_tickets FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own premium tickets"
ON public.premium_tickets FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all premium tickets"
ON public.premium_tickets FOR ALL
USING (is_admin(auth.uid()));

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payments"
ON public.payments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update payments"
ON public.payments FOR UPDATE
USING (is_admin(auth.uid()));

-- Refunds
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own refunds"
ON public.refunds FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all refunds"
ON public.refunds FOR ALL
USING (is_admin(auth.uid()));

-- AI Proposals
ALTER TABLE public.ai_ticket_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI proposals"
ON public.ai_ticket_proposals FOR ALL
USING (is_admin(auth.uid()));

-- Admin Settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view admin settings"
ON public.admin_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage admin settings"
ON public.admin_settings FOR ALL
USING (is_admin(auth.uid()));

-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour calculer le taux de perte d'un batch
CREATE OR REPLACE FUNCTION public.calculate_batch_loss_rate(batch_uuid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_sold INTEGER;
    total_losing INTEGER;
BEGIN
    SELECT sold_tickets, losing_tickets INTO total_sold, total_losing
    FROM public.ticket_batches
    WHERE id = batch_uuid;
    
    IF total_sold = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND(total_losing::NUMERIC / total_sold::NUMERIC, 2);
END;
$$;

-- Fonction pour vérifier si un remboursement est applicable
CREATE OR REPLACE FUNCTION public.is_refund_applicable(batch_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    loss_rate NUMERIC;
    threshold NUMERIC;
BEGIN
    loss_rate := public.calculate_batch_loss_rate(batch_uuid);
    
    SELECT (setting_value->>'value')::NUMERIC INTO threshold
    FROM public.admin_settings
    WHERE setting_key = 'refund_threshold';
    
    IF threshold IS NULL THEN
        threshold := 0.70;
    END IF;
    
    RETURN loss_rate >= threshold;
END;
$$;

-- Fonction pour mettre à jour la valeur des tickets premium
CREATE OR REPLACE FUNCTION public.update_premium_values()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    factors JSONB;
    total_revenue NUMERIC;
    total_users INTEGER;
    total_sales INTEGER;
    growth_multiplier NUMERIC;
BEGIN
    -- Récupérer les facteurs de croissance
    SELECT setting_value INTO factors
    FROM public.admin_settings
    WHERE setting_key = 'premium_growth_factors';
    
    -- Calculer les métriques (simplifié)
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue
    FROM public.payments
    WHERE status = 'completed';
    
    SELECT COUNT(DISTINCT user_id) INTO total_users
    FROM public.profiles;
    
    SELECT COUNT(*) INTO total_sales
    FROM public.payments
    WHERE payment_type = 'ticket_purchase' AND status = 'completed';
    
    -- Calculer le multiplicateur de croissance (formule simplifiée)
    growth_multiplier := 1 + (
        (total_revenue / 1000000) * (factors->>'revenue')::NUMERIC +
        (total_users / 1000) * (factors->>'users')::NUMERIC +
        (total_sales / 10000) * (factors->>'sales')::NUMERIC
    ) * 0.01;
    
    -- Mettre à jour tous les tickets premium non rachetés
    UPDATE public.premium_tickets
    SET 
        current_value = initial_value * growth_multiplier,
        growth_index = growth_multiplier,
        updated_at = now()
    WHERE redeemed_at IS NULL;
END;
$$;

-- Trigger pour updated_at sur les nouvelles tables
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_batches_updated_at
BEFORE UPDATE ON public.ticket_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_premium_tickets_updated_at
BEFORE UPDATE ON public.premium_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_physical_tickets_batch ON public.physical_tickets(batch_id);
CREATE INDEX IF NOT EXISTS idx_physical_tickets_match ON public.physical_tickets(match_id);
CREATE INDEX IF NOT EXISTS idx_electronic_tickets_batch ON public.electronic_tickets(batch_id);
CREATE INDEX IF NOT EXISTS idx_electronic_tickets_match ON public.electronic_tickets(match_id);
CREATE INDEX IF NOT EXISTS idx_premium_tickets_user ON public.premium_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_refunds_user ON public.refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_batch ON public.refunds(batch_id);
CREATE INDEX IF NOT EXISTS idx_ticket_batches_active ON public.ticket_batches(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_proposals_status ON public.ai_ticket_proposals(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
