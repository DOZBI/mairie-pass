-- Table pour les tickets IA générés (propositions de paris)
CREATE TABLE IF NOT EXISTS public.ai_football_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  ticket_name TEXT NOT NULL,
  ticket_description TEXT,
  predictions JSONB NOT NULL DEFAULT '[]', -- Array of {match_name, team_a, team_b, prediction, odds}
  is_combo BOOLEAN DEFAULT false,
  total_odds NUMERIC DEFAULT 1.0,
  estimated_win_multiplier NUMERIC DEFAULT 2.0,
  base_stake NUMERIC DEFAULT 100,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'closed', 'won', 'lost', 'refunded')),
  result TEXT CHECK (result IN ('pending', 'won', 'lost')),
  total_players INTEGER DEFAULT 0,
  total_stake NUMERIC DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour tracker les votes/participations des joueurs sur les tickets IA
CREATE TABLE IF NOT EXISTS public.ai_ticket_plays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_ticket_id UUID NOT NULL REFERENCES public.ai_football_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stake_amount NUMERIC NOT NULL,
  predicted_selections JSONB NOT NULL, -- Les sélections exactes du joueur
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'refunded')),
  potential_win NUMERIC,
  actual_win NUMERIC DEFAULT 0,
  is_identical_to_proposal BOOLEAN DEFAULT true, -- Si le joueur a fait exactement les mêmes pronostics
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ai_ticket_id, user_id)
);

-- Vue pour calculer le pourcentage de votes identiques
CREATE OR REPLACE VIEW public.ai_ticket_stats AS
SELECT 
  t.id as ticket_id,
  t.ticket_name,
  t.status,
  t.result,
  COUNT(p.id) as total_plays,
  SUM(p.stake_amount) as total_staked,
  COUNT(CASE WHEN p.is_identical_to_proposal THEN 1 END) as identical_plays,
  CASE 
    WHEN COUNT(p.id) > 0 
    THEN ROUND((COUNT(CASE WHEN p.is_identical_to_proposal THEN 1 END)::NUMERIC / COUNT(p.id)::NUMERIC) * 100, 2)
    ELSE 0 
  END as identical_percentage
FROM public.ai_football_tickets t
LEFT JOIN public.ai_ticket_plays p ON t.id = p.ai_ticket_id
GROUP BY t.id, t.ticket_name, t.status, t.result;

-- Fonction pour vérifier et appliquer la règle des 70%
CREATE OR REPLACE FUNCTION public.apply_70_percent_refund(ticket_uuid UUID)
RETURNS TABLE(refunded_count INTEGER, total_refunded NUMERIC) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ticket_status TEXT;
  ticket_result TEXT;
  identical_pct NUMERIC;
  refund_count INTEGER := 0;
  refund_amount NUMERIC := 0;
  play RECORD;
BEGIN
  -- Vérifier le statut du ticket
  SELECT status, result INTO ticket_status, ticket_result
  FROM ai_football_tickets WHERE id = ticket_uuid;
  
  IF ticket_result != 'lost' THEN
    RAISE EXCEPTION 'Le ticket n''est pas perdant';
  END IF;
  
  -- Calculer le pourcentage de joueurs identiques
  SELECT identical_percentage INTO identical_pct
  FROM ai_ticket_stats WHERE ticket_id = ticket_uuid;
  
  -- Si 70% ou plus ont joué identique, rembourser
  IF identical_pct >= 70 THEN
    FOR play IN 
      SELECT id, user_id, stake_amount 
      FROM ai_ticket_plays 
      WHERE ai_ticket_id = ticket_uuid 
        AND is_identical_to_proposal = true 
        AND status = 'lost'
    LOOP
      -- Mettre à jour le statut du play
      UPDATE ai_ticket_plays SET status = 'refunded', updated_at = now() WHERE id = play.id;
      
      -- Créditer le wallet
      UPDATE user_wallets 
      SET balance = balance + play.stake_amount, updated_at = now()
      WHERE user_id = play.user_id;
      
      -- Enregistrer le remboursement
      INSERT INTO ticket_transactions (
        user_id, transaction_type, amount, description, ticket_type
      ) VALUES (
        play.user_id, 'refund', play.stake_amount, 
        'Remboursement règle 70% - Ticket IA collectif', 'electronic'
      );
      
      refund_count := refund_count + 1;
      refund_amount := refund_amount + play.stake_amount;
    END LOOP;
    
    -- Mettre à jour le statut du ticket
    UPDATE ai_football_tickets SET status = 'refunded', updated_at = now() WHERE id = ticket_uuid;
  END IF;
  
  RETURN QUERY SELECT refund_count, refund_amount;
END;
$$;

-- Fonction pour distribuer les gains
CREATE OR REPLACE FUNCTION public.distribute_ai_ticket_wins(ticket_uuid UUID)
RETURNS TABLE(winners_count INTEGER, total_distributed NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  win_count INTEGER := 0;
  win_amount NUMERIC := 0;
  play RECORD;
BEGIN
  -- Mettre à jour tous les plays comme gagnants
  FOR play IN 
    SELECT id, user_id, stake_amount, potential_win 
    FROM ai_ticket_plays 
    WHERE ai_ticket_id = ticket_uuid AND status = 'active'
  LOOP
    -- Mettre à jour le play
    UPDATE ai_ticket_plays 
    SET status = 'won', actual_win = potential_win, updated_at = now() 
    WHERE id = play.id;
    
    -- Créditer le wallet
    UPDATE user_wallets 
    SET balance = balance + play.potential_win, 
        total_won = total_won + play.potential_win,
        updated_at = now()
    WHERE user_id = play.user_id;
    
    -- Enregistrer le gain
    INSERT INTO ticket_transactions (
      user_id, transaction_type, amount, description, ticket_type
    ) VALUES (
      play.user_id, 'win', play.potential_win, 
      'Gain Ticket IA Football', 'electronic'
    );
    
    win_count := win_count + 1;
    win_amount := win_amount + play.potential_win;
  END LOOP;
  
  -- Mettre à jour le statut du ticket
  UPDATE ai_football_tickets SET status = 'won', result = 'won', updated_at = now() WHERE id = ticket_uuid;
  
  RETURN QUERY SELECT win_count, win_amount;
END;
$$;

-- Enable RLS
ALTER TABLE public.ai_football_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_ticket_plays ENABLE ROW LEVEL SECURITY;

-- Policies pour ai_football_tickets
CREATE POLICY "Anyone can view active AI tickets"
ON public.ai_football_tickets FOR SELECT
USING (status IN ('proposed', 'active'));

CREATE POLICY "Admins can manage AI tickets"
ON public.ai_football_tickets FOR ALL
USING (is_admin(auth.uid()));

-- Policies pour ai_ticket_plays
CREATE POLICY "Users can view their own plays"
ON public.ai_ticket_plays FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own plays"
ON public.ai_ticket_plays FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all plays"
ON public.ai_ticket_plays FOR ALL
USING (is_admin(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_ai_football_tickets_updated_at
BEFORE UPDATE ON public.ai_football_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_ticket_plays_updated_at
BEFORE UPDATE ON public.ai_ticket_plays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour performances
CREATE INDEX idx_ai_ticket_plays_ticket ON public.ai_ticket_plays(ai_ticket_id);
CREATE INDEX idx_ai_ticket_plays_user ON public.ai_ticket_plays(user_id);
CREATE INDEX idx_ai_football_tickets_status ON public.ai_football_tickets(status);