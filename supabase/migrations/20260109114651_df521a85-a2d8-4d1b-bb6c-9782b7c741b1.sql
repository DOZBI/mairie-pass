
-- Corriger la politique RLS trop permissive sur audit_logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Nouvelle politique plus restrictive - seuls les utilisateurs authentifiés peuvent insérer
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
