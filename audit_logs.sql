-- =================================================================================
-- LAYER 6: AUDIT LOGGING
-- Run this in the Supabase SQL Editor to track malicious updates or deletions
-- =================================================================================

-- 1. Create the audit table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protect the audit logs (Append only, readable only by service role or admins)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No one can modify audit logs." ON audit_logs;
CREATE POLICY "No one can modify audit logs." ON audit_logs FOR ALL USING (false);

-- 2. Create the generic trigger function
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME::TEXT, OLD.id::TEXT, row_to_json(OLD)::JSONB);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME::TEXT, NEW.id::TEXT, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to profiles
DROP TRIGGER IF EXISTS profiles_audit_trigger ON profiles;
CREATE TRIGGER profiles_audit_trigger
AFTER UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- 4. Attach trigger to reviews
DROP TRIGGER IF EXISTS reviews_audit_trigger ON reviews;
CREATE TRIGGER reviews_audit_trigger
AFTER UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
