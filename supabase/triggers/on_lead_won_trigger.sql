-- Trigger: Promote a Lead to Client when status changes to 'won'
-- File: on_lead_won_trigger.sql

CREATE OR REPLACE FUNCTION promote_lead_to_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when status transitions to 'won'
  IF NEW.status = 'won' AND (OLD.status IS DISTINCT FROM 'won') THEN
    -- Prevent duplicate clients from the same lead
    IF NOT EXISTS (
      SELECT 1 FROM clients WHERE lead_id = NEW.id
    ) THEN
      INSERT INTO clients (first_name, last_name, email, phone, company, lead_id)
      VALUES (NEW.first_name, NEW.last_name, NEW.email, NEW.phone, NEW.company, NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to leads table
DROP TRIGGER IF EXISTS on_lead_won ON leads;

CREATE TRIGGER on_lead_won
  AFTER UPDATE OF status ON leads
  FOR EACH ROW
  WHEN (NEW.status = 'won')
  EXECUTE FUNCTION promote_lead_to_client();
