-- Allow admins to update predictions
CREATE POLICY "Admins_can_manage_predictions" ON predictions  
FOR ALL USING (  
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE  
);

-- Note: We only add USING. In Supabase/PostgreSQL, if WITH CHECK is omitted, 
-- USING is used for BOTH data visibility (SELECT/UPDATE/DELETE) AND inserts/updates validation.
