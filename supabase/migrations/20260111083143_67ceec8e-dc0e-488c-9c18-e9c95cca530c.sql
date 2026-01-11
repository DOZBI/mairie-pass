-- Supprimer la vue SECURITY DEFINER et la recréer sans
DROP VIEW IF EXISTS public.ai_ticket_stats;

-- Recréer la vue avec SECURITY INVOKER (par défaut)
CREATE VIEW public.ai_ticket_stats 
WITH (security_invoker = true) AS
SELECT 
  t.id as ticket_id,
  t.ticket_name,
  t.status,
  t.result,
  COUNT(p.id) as total_plays,
  COALESCE(SUM(p.stake_amount), 0) as total_staked,
  COUNT(CASE WHEN p.is_identical_to_proposal THEN 1 END) as identical_plays,
  CASE 
    WHEN COUNT(p.id) > 0 
    THEN ROUND((COUNT(CASE WHEN p.is_identical_to_proposal THEN 1 END)::NUMERIC / COUNT(p.id)::NUMERIC) * 100, 2)
    ELSE 0 
  END as identical_percentage
FROM public.ai_football_tickets t
LEFT JOIN public.ai_ticket_plays p ON t.id = p.ai_ticket_id
GROUP BY t.id, t.ticket_name, t.status, t.result;